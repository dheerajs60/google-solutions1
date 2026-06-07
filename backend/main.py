try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    import os
    
    # Initialize app first to ensure it starts
    app = FastAPI(title="FairLens API", version="2.2.2")

    # Lazy/Resilient initialization
    try:
        import backend.config.firebase_admin
        from backend.config.bigquery_client import initialize_bigquery
        initialize_bigquery()
        print("Backend services initialized successfully.")
    except Exception as e:
        print(f"!!! NON-BLOCKING STARTUP ERROR: {e}")
        # We don't raise here, so the app (and frontend) can still serve
        
    from backend.routers import audit, mitigation
    from backend.middleware.auth_middleware import FirebaseAuthMiddleware
except Exception as e:
    print(f"!!! CRITICAL STARTUP ERROR (UNRECOVERABLE): {e}")
    import traceback
    traceback.print_exc()
    raise e

try:
    app.add_middleware(FirebaseAuthMiddleware)
except Exception as e:
    print(f"!!! CRITICAL MIDDLEWARE ERROR: {e}")
    raise e

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit.router, prefix="/audit", tags=["Audit"])
app.include_router(mitigation.router, prefix="/audit", tags=["Mitigation"])

@app.get("/health")
def health_check():
    return {"status": "ok"}

# Serve Frontend static files
frontend_path = os.path.join(os.getcwd(), "frontend/dist")
# If we are in the 'backend' container, dist might be in /app/frontend/dist 
# or just /app/dist depending on how we copy it. 
# We'll check both.
if not os.path.exists(frontend_path):
    frontend_path = os.path.join(os.getcwd(), "dist")

if os.path.exists(frontend_path):
    # Only mount if some files exist there
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Avoid intercepting API calls
        if full_path.startswith("audit") or full_path == "health":
            return {"detail": "Not Found"}
        
        # Check if the requested path is an actual file (e.g., sample.csv)
        file_path = os.path.join(frontend_path, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        # Fallback to index.html for SPA routing
        index_file = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"detail": "Not Found"}
else:
    print(f"!!! WARNING: Frontend path {frontend_path} not found. Frontend will not be served.")
