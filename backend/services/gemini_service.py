import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env from root or current dir
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

# Initialize Gemini AI directly via API Key (Bypass Vertex AI restrictions)
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    # Using gemini-1.5-flash via Developer API
    model = genai.GenerativeModel("gemini-1.5-flash")
else:
    print("Critical: GEMINI_API_KEY is not set in environment.")
    model = None

def generate_bias_explanation_stream(metrics: dict, sensitive_attrs: list[str]):
    """
    Generates a professional bias audit explanation using Vertex AI Gemini 1.5 Pro (Streaming).
    """
    prompt = f"""
    You are a Lead Forensic Auditor specialized in Algorithmic Fairness. 
    Conduct a comprehensive and highly-detailed 'Lead Auditor's Report' on the statistical drivers of bias based on the provided metrics.
    
    AUDIT TRACE DATA:
    - Demographic Parity: {metrics.get('demographic_parity', {}).get('value', 'N/A')}
    - Equal Opportunity: {metrics.get('equal_opportunity', {}).get('value', 'N/A')}
    - Disparate Impact: {metrics.get('disparate_impact', {}).get('value', 'N/A')}
    - Audited Attributes: {', '.join(sensitive_attrs)}
    
    SECTIONS:
    1. **Detailed Statistical Driver Analysis**: Deep dive into the numeric metrics above. Explain what these numbers signify in a real-world context and why these disparities might exist (discuss covariance, sampling bias, etc.).
    2. **Proxy Variable Forensics**: Which other columns might be leaking info based on typical schemas? Provide specific examples.
    3. **Comprehensive Remediation Strategy**: Provide detailed, implementation-ready recommendations for both pre-processing (like Reweighing) and post-processing (like Threshold Adjustment) to resolve these issues.
    
    CONSTRAINTS:
    - Highly professional, clinical, and authoritative tone.
    - NO markdown headers (e.g., #). Use bolding (**) for sections.
    - Provide a thorough, in-depth analysis.
    
    AUDITOR'S REPORT:
    """
    
    if not model:
        yield "**Gemini AI Unavailable**: API Key missing. Please ensure GEMINI_API_KEY is set."
        return

    try:
        responses = model.generate_content(
            prompt,
            generation_config={"max_output_tokens": 2048, "temperature": 0.3},
            stream=True
        )
        for response in responses:
            if response.text:
                yield response.text
    except Exception as e:
        error_msg = str(e)
        yield f"\n\n**Error connecting to Gemini AI**: {error_msg}. Please check your API Key."

def generate_bias_explanation(metrics: dict, sensitive_attrs: list[str]) -> str:
    """
    Non-streaming version for backward compatibility.
    """
    if not model:
        return "**Gemini AI Unavailable**: API Key missing."
        
    try:
        response = model.generate_content(
            f"Summarize bias in 100 words: {str(metrics)} for {sensitive_attrs}",
            generation_config={"max_output_tokens": 1024, "temperature": 0.2}
        )
        return response.text.strip()
    except Exception as e:
        print(f"GenAI Error: {e}")
        return f"**Error connecting to Gemini AI**: {str(e)}"
