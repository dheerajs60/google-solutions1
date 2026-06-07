from pydantic import BaseModel
from typing import List, Dict, Optional, Any

class AuditRequestConfig(BaseModel):
    target_column: str
    positive_label: str
    sensitive_attributes: List[str]

class AuditMetric(BaseModel):
    value: float
    status: str
    description: str

class AuditResponse(BaseModel):
    id: str
    overall_score: float
    metrics: Dict[str, AuditMetric]
    heatmap: List[Dict[str, Any]]
    lineage: List[Dict[str, Any]]
    gemini_explanation: Optional[str] = ""
    group_comparisons: List[Dict[str, Any]]

class MitigationRequest(BaseModel):
    audit_id: str
    reweighing_strength: float = 0.5
    threshold_adjust: float = 0.5
    apply_postprocessing: bool = False

class ParetoPoint(BaseModel):
    accuracy: float
    fairness: float
    type: str

class MitigationResponse(BaseModel):
    before_metrics: Dict[str, AuditMetric]
    after_metrics: Dict[str, AuditMetric]
    pareto_points: List[ParetoPoint]
