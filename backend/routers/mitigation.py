from fastapi import APIRouter, HTTPException
from backend.models.schemas import MitigationRequest, MitigationResponse
from backend.services.store import update_mitigation_results
from backend.services.mitigation_service import run_mitigation

router = APIRouter()

@router.post("/mitigate", response_model=MitigationResponse)
async def mitigate_bias(request: MitigationRequest):
    print(f"Mitigation Triggered: Audit={request.audit_id}, Reweighing={request.reweighing_strength}, Post={request.apply_postprocessing}")
    try:
        result = run_mitigation(
            request.audit_id, 
            request.reweighing_strength, 
            request.threshold_adjust, 
            request.apply_postprocessing
        )
        # Persist the mitigation results in the session
        update_mitigation_results(request.audit_id, result.dict())
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/clear")
async def clear_mitigation(request: dict):
    audit_id = request.get("audit_id")
    from backend.services.store import ACTIVE_AUDITS, bq_client, project_id, np_encoder
    import json
    from google.cloud import bigquery
    if audit_id in ACTIVE_AUDITS:
        if "mitigation_results" in ACTIVE_AUDITS[audit_id]:
            del ACTIVE_AUDITS[audit_id]["mitigation_results"]
            
        if bq_client:
            try:
                data = ACTIVE_AUDITS[audit_id]
                serializable_data = {
                    k: v for k, v in data.items() 
                    if k in ["dataset", "date", "model_type", "sensitive_attrs", "target_column", "positive_label", "results", "mitigation_results", "user_id"]
                }
                clean_details = json.loads(json.dumps(serializable_data, default=np_encoder))
                details_str = json.dumps(clean_details)
                query = f"UPDATE `{project_id}.fair_audit.audits` SET full_details = @details WHERE audit_id = @id"
                job_config = bigquery.QueryJobConfig(query_parameters=[
                    bigquery.ScalarQueryParameter("details", "STRING", details_str),
                    bigquery.ScalarQueryParameter("id", "STRING", audit_id),
                ])
                bq_client.query(query, job_config=job_config).result()
            except Exception as e:
                print(f"Failed to clear mitigation in BQ: {e}")
    return {"status": "success"}
