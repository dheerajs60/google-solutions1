import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

test_models = [
    'gemini-1.5-pro',
    'models/gemini-1.5-pro',
    'gemini-1.5-flash',
    'models/gemini-1.5-flash',
    'gemini-pro',
    'models/gemini-pro'
]

for m_name in test_models:
    print(f"Testing model: {m_name}")
    try:
        model = genai.GenerativeModel(m_name)
        response = model.generate_content("Hi")
        print(f"✅ Success with {m_name}: {response.text.strip()}")
        break
    except Exception as e:
        print(f"❌ Failed with {m_name}: {e}")
