from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from firebase_admin import auth

class FirebaseAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Exclude frontend, assets, healthcheck and CORS preflight
        path = request.url.path
        if path in ["/", "/health", "/healthcheck", "/docs", "/openapi.json"] or \
           path.startswith("/assets/") or \
           not path.startswith("/audit") or \
           request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"detail": "Missing or invalid Authorization header"})

        token = auth_header.split(" ")[1]

        try:
            try:
                decoded_token = auth.verify_id_token(token)
            except Exception as ex:
                if "credentials were not found" in str(ex):
                    print("Warning: Firebase credentials missing. Bypassing token verification for local dev.")
                    decoded_token = {"uid": "local_developer"}
                else:
                    raise ex
            request.state.user = decoded_token
        except Exception as e:
            return JSONResponse(status_code=401, content={"detail": f"Invalid token: {str(e)}"})

        response = await call_next(request)
        return response
