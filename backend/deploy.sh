#!/usr/bin/env bash
# Deploys the application directly to Google Cloud Run from source
# Using the standard configuration requested

PROJECT_ID="hackathon-481806"
SERVICE_NAME="fair-audit-backend"
REGION="us-central1"

echo "Deploying FastAPI backend to Google Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 8080

echo "Deployment finished."
