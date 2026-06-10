from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
import pandas as pd
import io
import uuid
import datetime
from backend.models.schemas import AuditResponse, MitigationRequest, MitigationResponse
from backend.services.preprocessor import preprocess_data
from backend.services.bias_engine import run_bias_analysis

from backend.services.store import (
    get_audit_results, get_audit, update_audit_results, 
    get_history as store_get_history, store_audit,
    save_user_settings, get_user_settings
)
from backend.services.gemini_service import generate_bias_explanation, generate_bias_explanation_stream
from backend.services.mitigation_service import run_mitigation

router = APIRouter()

@router.get("/{audit_id}/analysis")
async def get_audit_analysis(audit_id: str):
    audit_data = get_audit(audit_id)
    if not audit_data:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    results = audit_data.get("results")
    sensitive_attrs = audit_data.get("sensitive_attrs")
    
    explanation = generate_bias_explanation(results["metrics"], sensitive_attrs)
    
    results["gemini_explanation"] = explanation
    update_audit_results(audit_id, results)
    
    return {"explanation": explanation}

@router.get("/{audit_id}/analysis/stream")
async def stream_audit_analysis(audit_id: str):
    audit_data = get_audit(audit_id)
    if not audit_data:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    results = audit_data.get("results")
    sensitive_attrs = audit_data.get("sensitive_attrs")
    
    dataset_stats = audit_data.get("dataset_stats", {})
    
    return StreamingResponse(
        generate_bias_explanation_stream(results["metrics"], sensitive_attrs, dataset_stats),
        media_type="text/event-stream"
    )

@router.get("/settings/{user_id}")
async def fetch_settings(user_id: str):
    return get_user_settings(user_id)

@router.post("/settings/{user_id}")
async def update_settings(user_id: str, settings: Dict[str, Any]):
    save_user_settings(user_id, settings)
    return {"status": "success"}

@router.get("/history")
async def get_history(user_id: str = None):
    return store_get_history(user_id)

@router.get("/{audit_id}", response_model=AuditResponse)
async def read_audit(audit_id: str):
    results = get_audit_results(audit_id)
    if not results:
        raise HTTPException(status_code=404, detail="Audit not found")
    return results

@router.get("/{audit_id}/export/csv")
async def export_audit_csv(audit_id: str):
    audit_data = get_audit(audit_id)
    if not audit_data:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    results = audit_data.get("results", {})
    metrics = results.get("metrics", {})
    
    # Flatten metrics for CSV
    rows = []
    # 1. Global Metrics
    for key, m in metrics.items():
        rows.append({
            "Category": "Core Metric",
            "Variable": key.replace("_", " ").title(),
            "Value": m.get("value") if isinstance(m, dict) else getattr(m, "value", 0.0),
            "Status": m.get("status") if isinstance(m, dict) else getattr(m, "status", "N/A"),
            "Description": m.get("description") if isinstance(m, dict) else getattr(m, "description", "")
        })
        
    # 2. Group Comparisons
    groups = results.get("group_comparisons", [])
    for g in groups:
        rows.append({
            "Category": "Group Analysis",
            "Variable": f"Group: {g.get('group')}",
            "Value": g.get("selection_rate"),
            "Status": "N/A",
            "Description": f"Sample Count: {g.get('count')}"
        })
        
    # Create CSV
    df = pd.DataFrame(rows)
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=FairLens_Audit_{audit_id}.csv"
    return response

@router.post("/run", response_model=AuditResponse)
async def run_audit(
    file: UploadFile = File(...),
    sensitive_attributes: str = Form(...),
    target_column: str = Form(...),
    positive_label: str = Form(...),
    user_id: str = Form(None)
):
    try:
        contents = await file.read()
        
        audit_id = str(uuid.uuid4())
        
        # Store to Firestore instead of Cloud Storage
        try:
            from backend.config.firebase_admin import db
            if db:
                safe_filename = file.filename.replace(" ", "_") if file.filename else "upload.csv"
                db.collection("audit_datasets").document(audit_id).set({
                    "filename": safe_filename,
                    "content": contents.decode("utf-8")
                })
        except Exception as e:
            print(f"Warning: Could not upload to Firestore: {e}")
        
        # Robust CSV reading from bytes
        try:
            df = pd.read_csv(io.BytesIO(contents))
        except Exception:
            # Fallback for weird encodings
            df = pd.read_csv(io.StringIO(contents.decode("utf-8", errors="ignore")))
        
        sensitive_attrs = [attr.strip() for attr in sensitive_attributes.split(",") if attr.strip()]
        
        df, log = preprocess_data(df, target_column, sensitive_attrs)
        result_dict = run_bias_analysis(df, sensitive_attrs, target_column, positive_label, audit_id=audit_id)
        
        dataset_stats = {
            "head": df.head(3).to_string() if not df.empty else "No data",
            "columns": list(df.columns),
            "total_rows": len(df)
        }
        
        # Track history
        data_to_store = {
            "dataset": file.filename,
            "model_type": "Classification",
            "date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "sensitive_attrs": sensitive_attrs,
            "target_column": target_column,
            "positive_label": positive_label,
            "dataset_stats": dataset_stats
        }
        store_audit(result_dict["id"], data_to_store, result_dict, user_id=user_id)
        
        return result_dict
    except Exception as e:
        # Pass meaningful errors like "Label not found" directly to frontend
        raise HTTPException(status_code=400, detail=str(e))

