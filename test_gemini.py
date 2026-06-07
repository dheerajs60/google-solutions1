import os
from dotenv import load_dotenv
load_dotenv()

from backend.services.gemini_service import generate_bias_explanation

metrics = {
    'demographic_parity': {'value': 0.85, 'status': 'PASS'},
    'equal_opportunity': {'value': 0.82, 'status': 'PASS'},
    'disparate_impact': {'value': 0.75, 'status': 'WARNING'}
}
attrs = ['sex', 'race']

print("Generating explanation...")
explanation = generate_bias_explanation(metrics, attrs)
print(f"Explanation: {explanation}")
