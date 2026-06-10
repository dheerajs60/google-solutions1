import sys
import os
import pandas as pd
import numpy as np

# Ensure backend modules are importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from backend.services.preprocessor import preprocess_data
from backend.services.bias_engine import run_bias_analysis
from backend.services.mitigation_service import run_mitigation

def test_full_flow():
    csv_path = "UCI_Adult_Income_Dataset.csv"
    target_column = "income"
    positive_label = ">50K"
    sensitive_attributes = ["sex", "race"]
    
    print(f"--- 🚀 Testing with {csv_path} ---")
    
    # 1. Load Data
    df = pd.read_csv(csv_path)
    df = df.sample(5000, random_state=42)
    print(f"Loaded and sampled {len(df)} rows.")
    
    # 2. Preprocess
    print("Preprocessing data...")
    df_clean, log = preprocess_data(df, target_column, sensitive_attributes)
    
    # 3. Running Audit
    print("Running Fairness Audit...")
    audit_result = run_bias_analysis(df_clean, sensitive_attributes, target_column, positive_label)
    
    print(f"\n[Audit Results]")
    print(f"Overall Fairness Score: {audit_result['overall_score']:.3f}")
    print(f"Gemini Explanation: {audit_result['gemini_explanation']}")
    print("-" * 30)
    for metric_name, data in audit_result['metrics'].items():
        print(f"Metric: {metric_name:20} | Value: {data['value']:.3f} | Status: {data['status']}")
    
    # 4. Running Mitigation
    print("\nRunning Mitigation Lab (ThresholdOptimizer)...")
    mitigation_result = run_mitigation(
        audit_id=audit_result['id'],
        reweighing_strength=0.5,
        threshold_adjust=0.5,
        apply_post=True
    )
    
    print(f"\n[Mitigation Results - Comparison]")
    print(f"{'Metric':20} | {'Before':10} | {'After':10}")
    print("-" * 45)
    for m in ["demographic_parity", "equal_opportunity", "demographic_parity_ratio"]:
        # Map our metrics to the response structure
        # Note: In bias_engine/mitigation_service, we use 'demographic_parity_ratio' which is synonymous with 'disparate_impact' in the UI
        key = m if m != "demographic_parity_ratio" else "disparate_impact"
        before_val = mitigation_result.before_metrics[key].value
        after_val = mitigation_result.after_metrics[key].value
        print(f"{m:20} | {before_val:.3f}      | {after_val:.3f}")
        
    print("\n[Accuracy vs Fairness Trade-off]")
    for pt in mitigation_result.pareto_points:
        print(f"Type: {pt.type:15} | Accuracy: {pt.accuracy:.3f} | Fairness: {pt.fairness:.3f}")

if __name__ == "__main__":
    test_full_flow()
