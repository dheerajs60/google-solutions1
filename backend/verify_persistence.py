import os
import sys
from google.cloud import firestore
from google.cloud import bigquery
import uuid
import datetime

# Add root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from config.firebase_admin import db, firebase_project_id
    from config.bigquery_client import bq_client, project_id as bq_project_id
except ImportError:
    try:
        from backend.config.firebase_admin import db, firebase_project_id
        from backend.config.bigquery_client import bq_client, project_id as bq_project_id
    except ImportError:
        print("Could not import backend config. Ensure you are running from the root or backend directory.")
        sys.exit(1)

def verify_firestore():
    print(f"\n--- Verifying Firestore (Project: {firebase_project_id}) ---")
    if not db:
        print("FAIL: Firestore client is None.")
        return False
    
    test_id = f"test_{uuid.uuid4().hex[:8]}"
    try:
        doc_ref = db.collection("audit_history").document(test_id)
        doc_ref.set({
            "id": test_id,
            "user_id": "system_test",
            "dataset": "test_connection.csv",
            "date": datetime.datetime.now().strftime("%Y-%m-%d"),
            "status": "PASS",
            "message": "Persistence Verification Successful"
        })
        print(f"PASS: Successfully wrote test document {test_id} to collection 'audit_history'")
        
        # Verify read
        doc = doc_ref.get()
        if doc.exists:
            print(f"PASS: Successfully read back test document {test_id}")
            doc_ref.delete()
            print(f"CLEANUP: Deleted test document {test_id}")
            return True
        else:
            print(f"FAIL: Written document {test_id} could not be retrieved.")
            return False
    except Exception as e:
        print(f"FAIL: Firestore error: {e}")
        return False

def verify_bigquery():
    print(f"\n--- Verifying BigQuery (Project: {bq_project_id}) ---")
    if not bq_client:
        print("FAIL: BigQuery client is None.")
        return False
    
    try:
        # Check dataset access
        dataset_id = "fair_audit"
        dataset_ref = bq_client.get_dataset(f"{bq_project_id}.{dataset_id}")
        print(f"PASS: Successfully accessed BigQuery dataset '{dataset_id}' in project {bq_project_id}")
        
        # Sample query
        query = f"SELECT count(*) as count FROM `{bq_project_id}.{dataset_id}.audits` LIMIT 1"
        query_job = bq_client.query(query)
        results = query_job.result()
        for row in results:
            print(f"PASS: Successfully queried 'audits' table. Current row count: {row.count}")
        
        return True
    except Exception as e:
        print(f"FAIL: BigQuery error: {e}")
        return False

if __name__ == "__main__":
    fs_ok = verify_firestore()
    bq_ok = verify_bigquery()
    
    print("\n--- FINAL SUMMARY ---")
    print(f"FIRESTORE: {'✅ OK' if fs_ok else '❌ FAILED'}")
    print(f"BIGQUERY:  {'✅ OK' if bq_ok else '❌ FAILED'}")
    
    if not fs_ok or not bq_ok:
        sys.exit(1)
    sys.exit(0)
