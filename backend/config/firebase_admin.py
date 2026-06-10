import firebase_admin
from firebase_admin import credentials, storage, firestore
import os

# Ensure Firebase uses the solutions project
firebase_project_id = os.getenv("FIREBASE_PROJECT_ID", "hackathon-481806")

def initialize_firebase():
    if not firebase_admin._apps:
        # Check standard GOOGLE_APPLICATION_CREDENTIALS
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET", f"{firebase_project_id}.firebasestorage.app")
        
        # Check standard GOOGLE_APPLICATION_CREDENTIALS first, then fallback to local file
        if not cred_path or not os.path.exists(cred_path):
            if os.path.exists("serviceAccountKey.json"):
                cred_path = "serviceAccountKey.json"
            elif os.path.exists("backend/serviceAccountKey.json"):
                cred_path = "backend/serviceAccountKey.json"
        
        # Globally export it so BigQuery and everything else works seamlessly
        if cred_path and os.path.exists(cred_path):
            abs_path = os.path.abspath(cred_path)
            if os.getenv("GOOGLE_APPLICATION_CREDENTIALS") != abs_path:
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = abs_path
                print(f"Firebase Admin: Exported GOOGLE_APPLICATION_CREDENTIALS from {cred_path}")
            cred = credentials.Certificate(cred_path)
            print(f"Loaded Firebase credentials from {cred_path}")
            firebase_admin.initialize_app(cred, {"storageBucket": bucket_name, "projectId": firebase_project_id})
        else:
            # Fallback to default if no explicit JSON path provided, will use Application Default Credentials
            try:
                firebase_admin.initialize_app(options={"storageBucket": bucket_name, "projectId": firebase_project_id})
            except Exception as e:
                print(f"Warning: Could not initialize firebase admin cleanly: {e}")
    
    # Configure 24 hour lifecycle deletion rule
    try:
        bucket = storage.bucket()
        if bucket.exists():
            rules = list(bucket.lifecycle_rules)
            has_rule = any(
                r.get("action", {}).get("type") == "Delete" and r.get("condition", {}).get("age") == 1
                for r in rules
            )
            if not has_rule:
                bucket.add_lifecycle_delete_rule(age=1)
                bucket.patch()
    except Exception as e:
        print(f"Warning: Could not configure bucket lifecycle rule (maybe bucket doesn't exist): {e}")

    # Safely get firestore client
    try:
        # initialize_app should already have the correct project ID from the certificate
        return firestore.client(database_id="fairlens")
    except Exception as e:
        print(f"Warning: Could not initialize Firestore client. Default credentials missing? Error: {e}")
        return None

db = initialize_firebase()
