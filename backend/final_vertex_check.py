import os
import sys
import vertexai
from vertexai.generative_models import GenerativeModel

PROJECT_ID = "hackathon-481806"

def diagnose_vertex():
    print(f"--- Vertex AI Multi-Region Check ---")
    
    cred_path = "backend/serviceAccountKey.json"
    if not os.path.exists(cred_path):
        cred_path = "serviceAccountKey.json"
    
    if os.path.exists(cred_path):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(cred_path)
    else:
        print("Credentials file not found.")
        return

    # Try different regions
    regions = ["us-central1", "us-east4", "us-west1"]
    model_name = "gemini-1.5-flash"
    
    for region in regions:
        print(f"\nTesting region: {region}...")
        try:
            vertexai.init(project=PROJECT_ID, location=region)
            model = GenerativeModel(model_name)
            response = model.generate_content("Say 'Region check successful'")
            print(f"✅ SUCCESS in {region}: {response.text}")
            return # Stop if one works
        except Exception as e:
            print(f"❌ FAILED in {region}: {e}")

    print("\n--- Next Steps ---")
    print("If all regions failed with 404, please check:")
    print("1. BILLING: Is a billing account linked to project 'hackathon-481806'?")
    print("2. QUOTA: Check Quotas page for 'Generative AI' in GCP console.")

if __name__ == "__main__":
    diagnose_vertex()
