import pandas as pd
import numpy as np
import sys
import asyncio
import traceback

from backend.services.bias_engine import run_bias_analysis
from backend.services.mitigation_service import run_mitigation
from backend.services.store import ACTIVE_AUDITS
from backend.routers.audit import stream_audit_analysis

def main():
    # 1. Create a dummy dataset
    data = {
        'age': np.random.randint(20, 60, 100),
        'income': np.random.randint(30000, 100000, 100),
        'gender': np.random.choice(['Male', 'Female'], 100),
        'approved': np.random.choice(['Yes', 'No'], 100)
    }
    df = pd.DataFrame(data)

    print("Running Bias Analysis...")
    try:
        audit_res = run_bias_analysis(df, ['gender'], 'approved', 'Yes', audit_id="test_audit_123")
        print("Bias Analysis successful. ACTIVE_AUDITS keys:", ACTIVE_AUDITS.keys())
    except Exception as e:
        print("Bias Analysis failed!")
        traceback.print_exc()
        sys.exit(1)

    print("\nRunning Mitigation...")
    try:
        mitigation_res = run_mitigation("test_audit_123", 0.5, 0.5, False)
        print("Mitigation successful.")
    except Exception as e:
        print("Mitigation failed!")
        traceback.print_exc()
        sys.exit(1)
        
    print("\nMitigation Result Metrics Keys:", mitigation_res.after_metrics.keys())
    
    # 3. Add mitigation results to ACTIVE_AUDITS (simulating update_mitigation_results)
    print("\nSimulating update_mitigation_results...")
    from backend.services.store import update_mitigation_results
    update_mitigation_results("test_audit_123", mitigation_res.dict())
    print("Updated ACTIVE_AUDITS with mitigation_results")
    
    # 4. Try to simulate AI stream
    print("\nSimulating stream_audit_analysis...")
    try:
        # Since stream_audit_analysis is async, we can run the internal logic
        audit_data = ACTIVE_AUDITS.get("test_audit_123")
        results = audit_data.get("results")
        sensitive_attrs = audit_data.get("sensitive_attrs")
        mitigation_res_dict = audit_data.get("mitigation_results")
        
        metrics_to_analyze = mitigation_res_dict["after_metrics"] if mitigation_res_dict else results["metrics"]
        dataset_stats = audit_data.get("dataset_stats", {})
        
        print("metrics_to_analyze:", metrics_to_analyze)
        print("sensitive_attrs:", sensitive_attrs)
        print("dataset_stats:", dataset_stats)
    except Exception as e:
        print("AI Stream logic failed!")
        traceback.print_exc()
        sys.exit(1)
        
    print("All tests passed.")

if __name__ == '__main__':
    main()
