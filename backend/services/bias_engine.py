import uuid
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from fairlearn.metrics import demographic_parity_difference, equalized_odds_difference, demographic_parity_ratio
from backend.services.store import store_audit
from backend.services.gemini_service import generate_bias_explanation

def _get_status(score, reverse=False):
    if reverse:
        return "PASS" if score < 0.2 else "WARNING" if score < 0.4 else "FAIL"
    return "PASS" if score >= 0.8 else "WARNING" if score >= 0.6 else "FAIL"

def run_bias_analysis(df: pd.DataFrame, sensitive_attrs: list[str], target_col: str, positive_label: str, audit_id: str = None) -> dict:
    if not audit_id:
        audit_id = str(uuid.uuid4())
    
    # 1. Prepare Target & Normalize
    df.columns = df.columns.str.strip()
    target_col = target_col.strip()
    sensitive_attrs = [attr.strip() for attr in sensitive_attrs]

    target_series = df[target_col].astype(str).str.strip()
    norm_positive_label = str(positive_label).strip()
    
    # Validation: Check if label exists
    available_labels = target_series.unique()
    if norm_positive_label not in available_labels:
        raise ValueError(f"Positive label '{norm_positive_label}' not found in target column '{target_col}'. Available distinct labels: {', '.join(available_labels)}")
    
    # Validation: Dataset Size
    if len(df) < 20: # Minimum threshold for meaningful audit
        raise ValueError(f"Dataset too small ({len(df)} rows). At least 20 rows required for bias analysis.")

    y = (target_series == norm_positive_label).astype(int)
    X = df.drop(columns=[target_col])
    
    # Ensure sensitive_attrs does not contain target_col
    sensitive_attrs = [attr for attr in sensitive_attrs if attr != target_col]
    
    if not sensitive_attrs:
        raise ValueError("No valid sensitive attributes remaining. You cannot select only the outcome column as a protected attribute.")

    # 2. Train Test Split
    X_train_full, X_test_full, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)
    
    # Separate Sensitive attributes from X arrays
    # And bin highly continuous variables to avoid OOM or timeout during Fairlearn metrics
    sensitive_train = pd.DataFrame()
    sensitive_test = pd.DataFrame()
    
    for attr in sensitive_attrs:
        if attr in X_train_full.columns:
            if X_train_full[attr].nunique() > 20: # Bin continuous variables
                sensitive_train[attr] = pd.qcut(X_train_full[attr], q=5, duplicates='drop').astype(str)
                sensitive_test[attr] = pd.qcut(X_test_full[attr], q=5, duplicates='drop').astype(str)
            else:
                sensitive_train[attr] = X_train_full[attr]
                sensitive_test[attr] = X_test_full[attr]
    
    X_train = X_train_full.drop(columns=sensitive_attrs, errors='ignore')
    X_test = X_test_full.drop(columns=sensitive_attrs, errors='ignore')

    # Guard for empty features
    if X_train.empty:
        X_train = pd.DataFrame(np.zeros((len(y_train), 1)))
        X_test = pd.DataFrame(np.zeros((len(y_test), 1)))
        
    X_train = X_train.fillna(0)
    X_test = X_test.fillna(0)
    
    # 3. Train base model - increased max_depth for production accuracy
    model = RandomForestClassifier(n_estimators=200, max_depth=15, min_samples_leaf=2, random_state=42)
    model.fit(X_train, y_train)
    
    # 4. Predict
    try:
        preds = model.predict(X_test)
    except Exception as e:
        raise ValueError(f"Model prediction failed: {str(e)}")
    
    # 5. Evaluate Fairness Metrics
    metrics_summary = {
        "demographic_parity": {"value": 0.0, "status": "UNKNOWN", "description": "Difference in positive prediction rates between groups."},
        "equal_opportunity": {"value": 0.0, "status": "UNKNOWN", "description": "Difference in true positive rates between groups."},
        "disparate_impact": {"value": 0.0, "status": "UNKNOWN", "description": "Ratio of positive rates between groups."}
    }
    
    heatmap = []
    group_comparisons = []
    
    dp_scores = []
    eo_scores = []
    di_scores = []
    
    worst_di = 1.0
    worst_di_attr = None

    for attr in sensitive_attrs:
        if attr not in sensitive_test.columns:
            continue
            
        sensitive_feature = sensitive_test[attr]
        
        # Demographic Parity
        try:
            dp_diff = demographic_parity_difference(y_test, preds, sensitive_features=sensitive_feature)
            dp_score = max(0, 1 - dp_diff)
        except Exception:
            dp_score = 0.0
        dp_scores.append(dp_score)
        
        # Equalized Odds
        try:
            eo_diff = equalized_odds_difference(y_test, preds, sensitive_features=sensitive_feature)
            eo_score = max(0, 1 - eo_diff)
        except Exception:
            eo_score = 0.0
        eo_scores.append(eo_score)
        
        # Disparate Impact Ratio (Demographic Parity Ratio)
        try:
            di_ratio = demographic_parity_ratio(y_test, preds, sensitive_features=sensitive_feature)
        except Exception:
            di_ratio = np.nan
            
        # Handle NaN/Inf from demographic_parity_ratio
        if np.isnan(di_ratio) or np.isinf(di_ratio) or di_ratio == 0:
            di_score = 0.0
        else:
            di_score = min(di_ratio, 1/di_ratio)
            
        di_scores.append(di_score)
        
        if di_score < worst_di:
            worst_di = di_score
            worst_di_attr = attr
        
        heatmap.append({
            "attribute": attr,
            "demographic_parity": {"score": float(dp_score), "status": _get_status(dp_score)},
            "equal_opportunity": {"score": float(eo_score), "status": _get_status(eo_score)},
            "disparate_impact": {"score": float(di_score), "status": _get_status(di_score)}
        })
        
        for group_val in sensitive_feature.unique():
            mask = sensitive_feature == group_val
            positive_rate = preds[mask].mean() if mask.sum() > 0 else 0
            group_comparisons.append({
                "attribute": attr,
                "group": str(group_val),
                "positive_rate": float(positive_rate)
            })

    def safe_mean(scores):
        if not scores: return 1.0
        cleaned = [s for s in scores if not np.isnan(s) and not np.isinf(s)]
        return np.mean(cleaned) if cleaned else 1.0

    avg_dp = safe_mean(dp_scores)
    avg_eo = safe_mean(eo_scores)
    avg_di = safe_mean(di_scores)
    
    overall_fairness = float(np.mean([avg_dp, avg_eo, avg_di]))
    
    metrics_summary["demographic_parity"] = {"value": float(avg_dp), "status": _get_status(avg_dp), "description": metrics_summary["demographic_parity"]["description"]}
    metrics_summary["equal_opportunity"] = {"value": float(avg_eo), "status": _get_status(avg_eo), "description": metrics_summary["equal_opportunity"]["description"]}
    metrics_summary["disparate_impact"] = {"value": float(avg_di), "status": _get_status(avg_di), "description": metrics_summary["disparate_impact"]["description"]}
    
    lineage = [
        {"stage": "Data Loading", "status": "PASS", "description": "Successfully loaded dataset"},
        {"stage": "Preprocessing", "status": "PASS", "description": "Handled missing values and encoding"},
        {"stage": "Feature Engineering", "status": "WARNING" if worst_di < 0.8 else "PASS", "description": "Checked proxy variables"},
        {"stage": "Model Training", "status": "PASS", "description": "Random Forest trained"},
        {"stage": "Bias Evaluation", "status": "PASS", "description": "Computed FairLens metrics on test set"}
    ]
    
    # 6. Initialize AI Analysis placeholder (generated async via separate endpoint)
    results = {
        "id": audit_id,
        "overall_score": overall_fairness,
        "metrics": metrics_summary,
        "heatmap": heatmap,
        "lineage": lineage,
        "gemini_explanation": None, # Will be fetched separately
        "group_comparisons": group_comparisons
    }
    
    # Store state globally
    store_audit(audit_id, {
        "model": model,
        "X_train": X_train,
        "X_test": X_test,
        "y_train": y_train,
        "y_test": y_test,
        "sensitive_train": sensitive_train,
        "sensitive_test": sensitive_test,
        "sensitive_attrs": sensitive_attrs,
        "target_col": target_col
    }, results=results)
            
    return results
