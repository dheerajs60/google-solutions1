from typing import Dict, Any, List
import json
import math
import datetime
import numpy as np
from google.cloud import bigquery
from firebase_admin import firestore

from backend.config.firebase_admin import db
from backend.config.bigquery_client import bq_client, project_id

def np_encoder(obj):
    import datetime
    if isinstance(obj, datetime.datetime) or hasattr(obj, "isoformat"):
        return obj.isoformat()
    if isinstance(obj, np.integer): return int(obj)
    if isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj): return str(obj)
        return float(obj)
    if isinstance(obj, np.ndarray): return obj.tolist()
    return str(obj)

# Global in-memory dictionary to store audit states.
ACTIVE_AUDITS: Dict[str, Dict[str, Any]] = {}

def store_audit(audit_id: str, data: Dict[str, Any], results: Dict[str, Any] = None, user_id: str = None):
    # Ensure we merge with existing in-memory state to preserve non-serializable objects (models)
    if audit_id in ACTIVE_AUDITS:
        ACTIVE_AUDITS[audit_id].update(data)
        if results:
            ACTIVE_AUDITS[audit_id]["results"] = results
        if user_id:
            ACTIVE_AUDITS[audit_id]["user_id"] = user_id
    else:
        ACTIVE_AUDITS[audit_id] = {**data, "results": results, "user_id": user_id}
    
    overall_score = results.get("overall_score", 0.0) if results else 0.0
    status = "PASS" if overall_score >= 0.8 else "WARNING" if overall_score >= 0.6 else "FAIL"
    
    timestamp = data.get("date", datetime.datetime.now().strftime("%Y-%m-%d"))
    dataset_name = data.get("dataset", "Uploaded_Dataset.csv")
    model_type = data.get("model_type", "Classification")

    # High-resilience storage block
    try:
        # Store lightweight metadata in Firestore (SOLUTIONS Project)
        if db:
            print(f"Firestore Diagnostics: Attempting to save to project '{db.project}'")
            doc_ref = db.collection("audit_history").document(audit_id)
            doc_ref.set({
                "id": audit_id,
                "user_id": user_id,
                "dataset": dataset_name,
                "date": timestamp,
                "model_type": model_type,
                "overall_score": overall_score,
                "status": status
            })
            print(f"Firestore: Successfully saved metadata for audit {audit_id} for user {user_id}")
        else:
            print("!!! Firestore CRITICAL: Database client is NONE.")

        # Store full details in BigQuery (HACKATHON Project)
        if bq_client:
            serializable_data = {
                k: v for k, v in data.items() 
                if k in ["dataset", "date", "model_type", "sensitive_attrs", "target_column", "positive_label"]
            }
            full_details = {**serializable_data, "results": results, "user_id": user_id}
            table_ref = f"{project_id}.fair_audit.audits"
            clean_details = json.loads(json.dumps(full_details, default=np_encoder))
            rows_to_insert = [{"audit_id": audit_id, "full_details": json.dumps(clean_details)}]
            
            errors = bq_client.insert_rows_json(table_ref, rows_to_insert)
            if errors:
                print(f"!!! BigQuery Insertion Error: {errors}")
            else:
                print(f"BigQuery: Successfully saved audit {audit_id} in project {project_id}")
    except Exception as e:
        print(f"!!! GLOBAL PERSISTENCE FAILURE for audit {audit_id}: {e}")
        import traceback
        traceback.print_exc()

def update_audit_results(audit_id: str, results: Dict[str, Any]):
    if audit_id in ACTIVE_AUDITS:
        ACTIVE_AUDITS[audit_id]["results"] = results
        
    if bq_client:
        try:
            clean_details = json.loads(json.dumps(ACTIVE_AUDITS.get(audit_id, {"results": results}), default=np_encoder))
            details_str = json.dumps(clean_details)
            query = f"""
                UPDATE `{project_id}.fair_audit.audits`
                SET full_details = @details
                WHERE audit_id = @id
            """
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("details", "STRING", details_str),
                    bigquery.ScalarQueryParameter("id", "STRING", audit_id),
                ]
            )
            bq_client.query(query, job_config=job_config).result()
        except Exception as e:
            print(f"BigQuery update error: {e}")

def update_mitigation_results(audit_id: str, mitigation_res: Dict[str, Any]):
    if audit_id in ACTIVE_AUDITS:
        ACTIVE_AUDITS[audit_id]["mitigation_results"] = mitigation_res
        
    # Extract the 'After' score for metadata update
    after_metrics = mitigation_res.get("after_metrics", {})
    dp = after_metrics.get("demographic_parity", {}).get("value", 1.0)
    eo = after_metrics.get("equal_opportunity", {}).get("value", 1.0)
    di = after_metrics.get("disparate_impact", {}).get("value", 1.0)
    
    mitigated_score = (dp + eo + di) / 3
    status = "PASS" if mitigated_score >= 0.8 else "WARNING" if mitigated_score >= 0.6 else "FAIL"
    
    # Update persistent storage so 'Recent Activity' reflects the mitigation
    try:
        if db:
            db.collection("audit_history").document(audit_id).update({
                "overall_score": mitigated_score,
                "status": status,
                "is_mitigated": True
            })
            
        if bq_client:
            # We also update the full details in BigQuery
            if audit_id in ACTIVE_AUDITS:
                data = ACTIVE_AUDITS[audit_id]
                serializable_data = {
                    k: v for k, v in data.items() 
                    if k in ["dataset", "date", "model_type", "sensitive_attrs", "target_column", "positive_label", "results", "mitigation_results", "user_id"]
                }
                clean_details = json.loads(json.dumps(serializable_data, default=np_encoder))
                details_str = json.dumps(clean_details)
                query = f"UPDATE `{project_id}.fair_audit.audits` SET full_details = @details WHERE audit_id = @id"
                job_config = bigquery.QueryJobConfig(
                    query_parameters=[
                        bigquery.ScalarQueryParameter("details", "STRING", details_str),
                        bigquery.ScalarQueryParameter("id", "STRING", audit_id),
                    ]
                )
                bq_client.query(query, job_config=job_config).result()
    except Exception as e:
        print(f"Error persisting mitigation results: {e}")

def get_history(user_id: str = None) -> List[Dict[str, Any]]:
    history = []
    
    # Normalize user_id
    if user_id in ["undefined", "null", ""]:
        user_id = None
                
    # 1. Try Firestore first (SOLUTIONS Project)
    if db:
        try:
            query = db.collection("audit_history")
            
            if user_id:
                # Get user's specific audits ONLY to ensure isolation
                from google.cloud.firestore_v1.base_query import FieldFilter
                user_docs = query.where(filter=FieldFilter("user_id", "==", user_id)).stream()
                history = [doc.to_dict() for doc in user_docs]
                
                # Sort in-memory: newer dates first, handling None gracefully
                history.sort(key=lambda x: str(x.get("date") or ""), reverse=True)
                history = history[:50]
            else:
                # No user_id filter, we can use native ordering on a single field
                docs = query.order_by("date", direction=firestore.Query.DESCENDING).limit(50).stream()
                history = [doc.to_dict() for doc in docs]
                
        except Exception as e:
            print(f"!!! Firestore Read Error: {e}")
        
    print(f"History: Found {len(history)} records in Firestore for local user_id: {user_id}")

    # 2. If nothing in Firestore, fallback to BigQuery (HACKATHON Project)
    if not history and bq_client:
        try:
            query = f"SELECT audit_id, full_details FROM `{project_id}.fair_audit.audits`"
            if user_id:
                 query += f" WHERE JSON_EXTRACT_SCALAR(full_details, '$.user_id') = '{user_id}'"
            query += " ORDER BY audit_id DESC LIMIT 50"
            results = bq_client.query(query).result()
            for row in results:
                details = row.full_details
                if isinstance(details, str):
                    details = json.loads(details)
                res = details.get("results") or {}
                overall_score = res.get("overall_score", 0.0)
                status = "PASS" if overall_score >= 0.8 else "WARNING" if overall_score >= 0.6 else "FAIL"
                
                history.append({
                    "id": row.audit_id,
                    "dataset": details.get("dataset", "Unknown"),
                    "date": details.get("date", datetime.datetime.now().strftime("%Y-%m-%d")),
                    "model_type": details.get("model_type", "Classification"),
                    "overall_score": overall_score,
                    "status": status
                })
        except Exception as e:
            print(f"BigQuery history read error: {e}")

    # 3. Final fallback: local in-memory audits (Filtered by user_id!)
    if not history:
        for key, value in ACTIVE_AUDITS.items():
            # Apply user filtering to in-memory fallback
            record_user_id = value.get("user_id")
            if user_id and record_user_id != user_id:
                continue
                
            overall_score = (value.get("results") or {}).get("overall_score", 0.0)
            status = "PASS" if overall_score >= 0.8 else "WARNING" if overall_score >= 0.6 else "FAIL"
            history.append({
                "id": key,
                "dataset": value.get("dataset", "Unknown"),
                "date": value.get("date", "2026-04-08"),
                "model_type": value.get("model_type", "Classification"),
                "overall_score": overall_score,
                "status": status
            })
            

    # Sanitize history to prevent serialization errors
    sanitized_history = []
    for item in history:
        clean_item = json.loads(json.dumps(item, default=np_encoder))
        
        # Also clean up NaN which causes JS JSON.parse to fail if it somehow slips through
        for k, v in clean_item.items():
            if isinstance(v, float) and math.isnan(v):
                clean_item[k] = 0.0
                
        sanitized_history.append(clean_item)
    return sanitized_history


def get_audit(audit_id: str) -> Dict[str, Any]:
    # Prioritize in-memory state to avoid race conditions with slow BigQuery updates
    if audit_id in ACTIVE_AUDITS:
        return ACTIVE_AUDITS[audit_id]
        
    if bq_client:
        try:
            query = f"""
                SELECT full_details 
                FROM `{project_id}.fair_audit.audits`
                WHERE audit_id = @id
            """
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("id", "STRING", audit_id),
                ]
            )
            result = bq_client.query(query, job_config=job_config).result()
            for row in result:
                details = row.full_details
                if isinstance(details, str):
                    return json.loads(details)
                return details
        except Exception as e:
            print(f"BigQuery read error: {e}")
        
    return None

def get_audit_results(audit_id: str) -> Dict[str, Any]:
    audit = get_audit(audit_id)
    return audit.get("results") if audit else None

def save_user_settings(user_id: str, settings: Dict[str, Any]):
    if not db:
        return
    try:
        doc_ref = db.collection("user_settings").document(user_id)
        doc_ref.set(settings, merge=True)
    except Exception as e:
        print(f"Error saving user settings: {e}")

def get_user_settings(user_id: str) -> Dict[str, Any]:
    if not db:
        return {}
    try:
        doc = db.collection("user_settings").document(user_id).get()
        if doc.exists:
            return doc.to_dict()
    except Exception as e:
        print(f"Error fetching user settings: {e}")
    return {}
