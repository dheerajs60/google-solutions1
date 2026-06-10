import os
import vertexai
from vertexai.generative_models import GenerativeModel
from dotenv import load_dotenv

# Load .env from root or current dir
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

# 1. Project Configuration
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "hackathon-481806")
# Use us-central1 for better availability with 2.5-pro
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")

# 2. Credential Management
def setup_credentials():
    if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
        # Look for the service account key in common locations
        possible_paths = [
            "serviceAccountKey.json",
            "backend/serviceAccountKey.json",
            os.path.join(os.path.dirname(__file__), "../serviceAccountKey.json")
        ]
        for path in possible_paths:
            if os.path.exists(path):
                os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.abspath(path)
                print(f"Vertex AI: Using service account key at {path}")
                break

setup_credentials()

# 3. Initialize Vertex AI
try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
    model = GenerativeModel("gemini-2.5-flash")
except Exception as e:
    print(f"Critical: Failed to initialize Vertex AI: {e}")
    model = None

def generate_bias_explanation_stream(metrics: dict, sensitive_attrs: list[str], dataset_stats: dict = {}):
    """
    Generates a professional bias audit explanation using Vertex AI Gemini.
    """
    prompt = f"""
    You are a Lead Forensic Auditor specialized in Algorithmic Fairness. 
    Conduct a comprehensive and highly-detailed 'Lead Auditor's Report' on the statistical drivers of bias based on the provided metrics.
    
    AUDIT TRACE DATA:
    - Demographic Parity: {metrics.get('demographic_parity', {}).get('value', 'N/A')}
    - Equal Opportunity: {metrics.get('equal_opportunity', {}).get('value', 'N/A')}
    - Disparate Impact: {metrics.get('disparate_impact', {}).get('value', 'N/A')}
    - Audited Attributes: {', '.join(sensitive_attrs)}
    
    DATASET CONTEXT:
    - Total Rows: {dataset_stats.get('total_rows', 'Unknown')}
    - Columns: {', '.join(dataset_stats.get('columns', []))}
    - Sample Data (first 3 rows):
    {dataset_stats.get('head', 'Not provided')}
    
    SECTIONS:
    1. **Detailed Statistical Driver Analysis**: Deep dive into the numeric metrics and the dataset context. Explain what these numbers signify in a real-world context for this specific dataset and why these disparities might exist (discuss covariance, sampling bias, etc.).
    2. **Proxy Variable Forensics**: Which other columns might be leaking info based on typical schemas? Provide specific examples.
    3. **Comprehensive Remediation Strategy**: Provide detailed, implementation-ready recommendations for both pre-processing (like Reweighing) and post-processing (like Threshold Adjustment) to resolve these issues.
    
    CONSTRAINTS:
    - Highly professional, clinical, and authoritative tone.
    - NO markdown headers (e.g., #). Use bolding (**) for sections.
    - Provide a thorough, in-depth analysis.
    
    AUDITOR'S REPORT:
    """
    
    if not model:
        yield "**Vertex AI Unavailable**: Real AI generation failed because Vertex AI could not be initialized. Please check your Google Cloud Application Default Credentials and ensure the Vertex AI API is enabled in project " + PROJECT_ID
        return

    try:
        responses = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": 8192, "temperature": 0.3},
            stream=True
        )
        for response in responses:
            try:
                if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
                    yield response.text
            except Exception as chunk_e:
                print(f"Skipping empty chunk: {chunk_e}")
                pass
    except Exception as e:
        error_msg = str(e)
        yield f"\n\n**Error connecting to Vertex AI**: {error_msg}. Please check your quota and credentials."

def generate_bias_explanation(metrics: dict, sensitive_attrs: list[str]) -> str:
    """
    Non-streaming version for backward compatibility.
    """
    if not model:
        return "**Vertex AI Unavailable**: Real AI generation failed because Vertex AI could not be initialized."
        
    try:
        response = model.generate_content(
            f"Summarize bias in 100 words: {str(metrics)} for {sensitive_attrs}",
            generation_config={"max_output_tokens": 8192, "temperature": 0.2}
        )
        if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
            return response.text.strip()
        return "No text generated.".strip()
    except Exception as e:
        print(f"GenAI Error: {e}")
        return f"**Error connecting to Vertex AI**: {str(e)}"
