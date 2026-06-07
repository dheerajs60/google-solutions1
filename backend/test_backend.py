import sys
import pandas as pd
import numpy as np

# Adjust python path
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.services.preprocessor import preprocess_data
from backend.services.bias_engine import run_bias_analysis
from backend.services.mitigation_service import run_mitigation

def main():
    print("Loading data...")
    # Read adult data and add headers
    columns = [
        "age", "workclass", "fnlwgt", "education", "education-num", 
        "marital-status", "occupation", "relationship", "race", "sex", 
        "capital-gain", "capital-loss", "hours-per-week", "native-country", "income"
    ]
    df = pd.read_csv(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "UCI_Adult_Income_Dataset.csv")), index_col=False)
    
    # Strip whitespace from string columns
    for col in df.select_dtypes(['object']).columns:
        df[col] = df[col].str.strip()
    
    # Take a sample for fast testing
    df = df.sample(3000, random_state=42)
    
    target_column = "income"
    positive_label = ">50K"
    sensitive_attrs = ["sex", "race"]
    
    # 1. Preprocess
    print("Preprocessing...")
    df_clean, log = preprocess_data(df, target_column, sensitive_attrs)
    
    # 2. Bias Analysis
    print("Running Bias Engine...")
    result = run_bias_analysis(df_clean, sensitive_attrs, target_column, positive_label)
    audit_id = result["id"]
    
    print(f"Overall Fairness: {result['overall_score']:.3f}")
    for k, v in result["metrics"].items():
        print(f"  {k}: {v['value']:.3f} ({v['status']})")
    
    # 3. Mitigation
    print("\nRunning Mitigation Engine (ThresholdOptimizer)...")
    mit_res = run_mitigation(audit_id, reweighing_strength=0.5, threshold_adjust=0.5, apply_post=True)
    
    print("BEFORE METRICS:")
    for k, v in mit_res.before_metrics.items():
        print(f"  {k}: {v.value:.3f} ({v.status})")
        
    print("AFTER METRICS:")
    for k, v in mit_res.after_metrics.items():
        print(f"  {k}: {v.value:.3f} ({v.status})")

if __name__ == "__main__":
    main()
