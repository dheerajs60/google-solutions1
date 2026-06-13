import os
import re

def fix_store(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Fix where clause
    content = content.replace(
        'user_docs = query.where("user_id", "==", user_id).stream()',
        'from google.cloud.firestore_v1.base_query import FieldFilter\n                user_docs = query.where(filter=FieldFilter("user_id", "==", user_id)).stream()'
    )

    # Sanitize history output
    sanitize_code = """
    # Sanitize history to prevent serialization errors
    sanitized_history = []
    for item in history:
        clean_item = json.loads(json.dumps(item, default=np_encoder))
        
        # Also clean up NaN which causes JS JSON.parse to fail if it somehow slips through
        for k, v in clean_item.items():
            if isinstance(v, float) and math.isnan(v):
                clean_item[k] = 0.0
                
        sanitized_history.append(clean_item)
    return sanitized_history
"""
    
    content = content.replace('    return history', sanitize_code)

    # Add import math if not present
    if 'import math' not in content:
        content = content.replace('import json\n', 'import json\nimport math\n')

    with open(file_path, 'w') as f:
        f.write(content)

fix_store("/Users/kovoordheeraj/Documents/google solutions updated/google_solutions-main/backend/services/store.py")
fix_store("/Users/kovoordheeraj/Documents/google solutions updated/fairlens-main/backend/services/store.py")
print("Done")
