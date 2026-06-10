import google.auth
import google.auth.transport.requests
import requests
import json

from google.oauth2 import service_account

try:
    # 1. Get credentials from service account file
    credentials = service_account.Credentials.from_service_account_file(
        "serviceAccountKey.json",
        scopes=["https://www.googleapis.com/auth/cloud-platform"]
    )
    
    # Refresh to get an access token
    auth_req = google.auth.transport.requests.Request()
    if not credentials.valid:
        credentials.refresh(auth_req)
        
    token = credentials.token
    
    # 2. Query Cloud Run services in asia-south2 for project hackathon-481806
    project_id = "hackathon-481806"
    region = "asia-south2"
    url = f"https://run.googleapis.com/v1/projects/{project_id}/locations/{region}/services"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        services = response.json().get("items", [])
        print(f"Found {len(services)} services in {region}")
        for s in services:
            print(f"--- Service: {s.get('metadata', {}).get('name')} ---")
            print(f"URL: {s.get('status', {}).get('url')}")
            
            # Check traffic
            traffic = s.get("status", {}).get("traffic", [])
            print(f"Traffic details: {json.dumps(traffic)}")
            
            # Check latest ready revision
            print(f"Latest Ready Revision: {s.get('status', {}).get('latestReadyRevisionName')}")
            
            # Conditions
            conditions = s.get("status", {}).get("conditions", [])
            for c in conditions:
                if c.get("type") == "Ready":
                    print(f"Ready Status: {c.get('status')} - {c.get('message', '')}")
                    break
    else:
        print(f"Error fetching services: {response.status_code} - {response.text}")
        
except Exception as e:
    print(f"Script failed: {e}")
