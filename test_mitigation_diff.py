import pandas as pd
import numpy as np
import sys
import asyncio

from backend.services.bias_engine import run_bias_analysis
from backend.services.mitigation_service import run_mitigation
from backend.services.store import ACTIVE_AUDITS

def main():
    np.random.seed(42)
    # create biased dataset
    # gender=Male more likely to be approved
    gender = np.random.choice(['Male', 'Female'], 500)
    # 80% Male approved, 20% Female approved
    approved = ['Yes' if g == 'Male' and np.random.rand() < 0.8 else 'No' for g in gender]
    approved = ['Yes' if g == 'Female' and np.random.rand() < 0.2 else a for g, a in zip(gender, approved)]
    
    data = {
        'age': np.random.randint(20, 60, 500),
        'income': np.random.randint(30000, 100000, 500),
        'gender': gender,
        'approved': approved
    }
    df = pd.DataFrame(data)

    audit_res = run_bias_analysis(df, ['gender'], 'approved', 'Yes', audit_id="test_audit")
    
    mitigation_res = run_mitigation("test_audit", 1.0, 1.0, True)
    
    print("BEFORE METRICS:")
    for k, v in mitigation_res.before_metrics.items():
        print(f"  {k}: {v.value}")
        
    print("\nAFTER METRICS:")
    for k, v in mitigation_res.after_metrics.items():
        print(f"  {k}: {v.value}")

if __name__ == '__main__':
    main()
