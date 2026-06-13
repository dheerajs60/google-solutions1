from typing import Union, Dict
import pandas as pd
from sklearn.metrics import accuracy_score
from fairlearn.postprocessing import ThresholdOptimizer
from fairlearn.metrics import demographic_parity_difference, equalized_odds_difference, demographic_parity_ratio
from backend.models.schemas import MitigationResponse, AuditMetric, ParetoPoint
from backend.services.store import ACTIVE_AUDITS

def _get_status(score):
    return "PASS" if score >= 0.8 else "WARNING" if score >= 0.6 else "FAIL"

from fairlearn.preprocessing import CorrelationRemover
from sklearn.ensemble import RandomForestClassifier

def run_mitigation(audit_id: str, reweighing_strength: Union[float, Dict[str, float]], threshold_adjust: float, apply_post: bool) -> MitigationResponse:
    stored = ACTIVE_AUDITS.get(audit_id)
    if not stored:
        raise ValueError("Audit ID not found or expired from memory. Please re-run the audit.")
        
    base_model = stored["model"]
    X_train = stored["X_train"]
    y_train = stored["y_train"]
    X_test = stored["X_test"]
    y_test = stored["y_test"]
    sensitive_train = stored["sensitive_train"]
    sensitive_test = stored["sensitive_test"]
    sensitive_attrs = stored["sensitive_attrs"]
    
    # 1. BASE PREDICTIONS
    preds_before = base_model.predict(X_test)
    acc_before = accuracy_score(y_test, preds_before)
    
    primary_attr = sensitive_attrs[0]
    sa_train = sensitive_train[primary_attr]
    sa_test = sensitive_test[primary_attr]
    
    dp_score_before = 1 - demographic_parity_difference(y_test, preds_before, sensitive_features=sa_test)
    eo_score_before = 1 - equalized_odds_difference(y_test, preds_before, sensitive_features=sa_test)
    di_ratio_before = demographic_parity_ratio(y_test, preds_before, sensitive_features=sa_test)
    di_score_before = min(di_ratio_before, 1/di_ratio_before) if di_ratio_before != 0 else 0
    fairness_before = (dp_score_before + eo_score_before + di_score_before) / 3
    
    # 2. MITIGATION PIPELINE
    current_model = base_model
    final_preds = preds_before
    
    # If AUTO-CORRECT is on, force maximum strengths
    if apply_post:
        if isinstance(reweighing_strength, dict):
            reweighing_strength = {k: 1.0 for k in sensitive_attrs}
        else:
            reweighing_strength = 1.0
        threshold_adjust = 1.0
    
    # PHASE A: IN-PROCESSING (REWEIGHING)
    # If strength > 0, we re-train with sample weights to balance outcomes
    has_reweighing = False
    if isinstance(reweighing_strength, dict):
        has_reweighing = any(v > 0.1 for v in reweighing_strength.values())
    else:
        has_reweighing = reweighing_strength > 0.1

    if has_reweighing:
        # Calculate sample weights for Demographic Parity
        y_total = len(y_train)
        y_pos = y_train.sum()
        y_neg = y_total - y_pos
        
        weights = pd.Series(1.0, index=y_train.index)
        
        for attr in sensitive_attrs:
            sa_train_attr = sensitive_train[attr]
            attr_strength = reweighing_strength.get(attr, 0.5) if isinstance(reweighing_strength, dict) else reweighing_strength
            
            if attr_strength <= 0.1:
                continue
                
            attr_weights = pd.Series(1.0, index=y_train.index)
            for group in sa_train_attr.unique():
                mask = (sa_train_attr == group)
                group_total = mask.sum()
                if group_total == 0: continue
                
                group_pos = (y_train[mask] == 1).sum()
                group_neg = group_total - group_pos
                
                # Theoretical weights to achieve parity
                target_pos_rate = y_pos / y_total
                current_pos_rate = group_pos / group_total
                if group_pos > 0:
                    pos_weight = target_pos_rate / current_pos_rate
                    attr_weights[mask & (y_train == 1)] = 1.0 + (pos_weight - 1.0) * attr_strength
                
                target_neg_rate = y_neg / y_total
                current_neg_rate = group_neg / group_total
                if group_neg > 0:
                    neg_weight = target_neg_rate / current_neg_rate
                    attr_weights[mask & (y_train == 0)] = 1.0 + (neg_weight - 1.0) * attr_strength
            
            # Multiply intersectional weights
            weights *= attr_weights
        
        # Ensure weights are positive and not too crazy
        weights = weights.clip(lower=0.1, upper=10.0)
        
        # Re-train Random Forest with weights
        new_model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
        new_model.fit(X_train, y_train, sample_weight=weights)
        current_model = new_model
        final_preds = current_model.predict(X_test)

    # PHASE B: POST-PROCESSING (THRESHOLD OPTIMIZATION)
    # If strength > 0 or explicit apply_post is on
    if apply_post or threshold_adjust > 0.1:
        # AGGRESSIVE MODE: Ensuring the most "perfect" fairness result
        constraints = "demographic_parity"
        
        try:
            optimizer = ThresholdOptimizer(
                estimator=current_model,
                constraints=constraints,
                predict_method="predict_proba",
                prefit=True
            )
            optimizer.fit(X_train, y_train, sensitive_features=sa_train)
            final_preds = optimizer.predict(X_test, sensitive_features=sa_test)
            print(f"Mitigation complete: Aggressive={apply_post}")
        except Exception as e:
            print(f"ThresholdOptimizer failed (likely degenerate labels): {e}. Falling back to pre-processing only.")
            # final_preds remains what it was from Phase A
        
    # 3. EVALUATE AFTER
    acc_after = accuracy_score(y_test, final_preds)
    dp_score_after = 1 - demographic_parity_difference(y_test, final_preds, sensitive_features=sa_test)
    eo_score_after = 1 - equalized_odds_difference(y_test, final_preds, sensitive_features=sa_test)
    di_ratio_after = demographic_parity_ratio(y_test, final_preds, sensitive_features=sa_test)
    di_score_after = min(di_ratio_after, 1/di_ratio_after) if di_ratio_after != 0 else 0
    fairness_after = (dp_score_after + eo_score_after + di_score_after) / 3
    
    return MitigationResponse(
        before_metrics={
            "demographic_parity": AuditMetric(value=float(dp_score_before), status=_get_status(dp_score_before), description=f"DP ({primary_attr})"),
            "equal_opportunity": AuditMetric(value=float(eo_score_before), status=_get_status(eo_score_before), description=f"EO ({primary_attr})"),
            "disparate_impact": AuditMetric(value=float(di_score_before), status=_get_status(di_score_before), description=f"DI ({primary_attr})"),
            "accuracy": AuditMetric(value=float(acc_before), status="PASS", description="Model Accuracy")
        },
        after_metrics={
            "demographic_parity": AuditMetric(value=float(dp_score_after), status=_get_status(dp_score_after), description=f"DP ({primary_attr})"),
            "equal_opportunity": AuditMetric(value=float(eo_score_after), status=_get_status(eo_score_after), description=f"EO ({primary_attr})"),
            "disparate_impact": AuditMetric(value=float(di_score_after), status=_get_status(di_score_after), description=f"DI ({primary_attr})"),
            "accuracy": AuditMetric(value=float(acc_after), status="PASS", description="Model Accuracy")
        },
        pareto_points=[
            ParetoPoint(accuracy=float(acc_before), fairness=float(fairness_before), type="Current"),
            ParetoPoint(accuracy=float(acc_after), fairness=float(fairness_after), type="After Mitigation")
        ]
    )
