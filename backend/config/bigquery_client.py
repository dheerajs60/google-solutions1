import os
from google.cloud import bigquery
from google.api_core.exceptions import NotFound

def get_bigquery_client():
    """Initializes and returns a BigQuery client using explicit project ID."""
    try:
        # Use hackathon project for BigQuery
        current_project = os.getenv("GOOGLE_CLOUD_PROJECT", "hackathon-481806")
        return bigquery.Client(project=current_project)
    except Exception as e:
        print(f"Warning: Could not initialize BigQuery client. Default credentials missing? Error: {e}")
        return None

def ensure_bigquery_schema(client: bigquery.Client, project_id: str, dataset_id: str = "fair_audit", table_id: str = "audits"):
    """
    Ensures that the specified dataset and table exist.
    Creates them if they do not.
    """
    dataset_ref = f"{project_id}.{dataset_id}"
    
    # Check/create dataset
    try:
        client.get_dataset(dataset_ref)
    except NotFound:
        print(f"Dataset {dataset_ref} not found. Creating...")
        dataset = bigquery.Dataset(dataset_ref)
        dataset.location = "US"
        client.create_dataset(dataset, timeout=30)
        print(f"Created dataset {dataset_ref}")

    table_ref = f"{dataset_ref}.{table_id}"
    
    # Check/create table
    try:
        client.get_table(table_ref)
    except NotFound:
        print(f"Table {table_ref} not found. Creating...")
        schema = [
            bigquery.SchemaField("audit_id", "STRING", mode="REQUIRED"),
            bigquery.SchemaField("full_details", "JSON", mode="REQUIRED"),
        ]
        table = bigquery.Table(table_ref, schema=schema)
        client.create_table(table, timeout=30)
        print(f"Created table {table_ref}")

def initialize_bigquery():
    """Explicitly initializes the BigQuery schema."""
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "hackathon-481806")
    client = get_bigquery_client()
    if not client:
        print("!!! BigQuery Error: Client could not be initialized.")
        return
    
    try:
        ensure_bigquery_schema(client, project_id)
        print(f"BigQuery: Schema ensured for project {project_id}")
    except Exception as e:
        print(f"!!! BigQuery Schema Error: {e}")

project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "hackathon-481806")
bq_client = get_bigquery_client()

# Call on module load, but ALSO allow explicit calls
if __name__ == "__main__":
    initialize_bigquery()
else:
    # We still try to ensure on import, but we'll call it again in main.py for robustness
    try:
        if bq_client:
            ensure_bigquery_schema(bq_client, project_id)
    except Exception as e:
        print(f"Warning: BigQuery initialization on import failed: {e}")
