import os

def fix_encoder(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    new_encoder = """
def np_encoder(obj):
    import datetime
    if isinstance(obj, datetime.datetime) or hasattr(obj, "isoformat"):
        return obj.isoformat()
    if isinstance(obj, np.integer): return int(obj)
    if isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj): return str(obj)
        return float(obj)
    if isinstance(obj, np.ndarray): return obj.tolist()
    return str(obj)
"""
    # Replace the existing np_encoder
    import re
    content = re.sub(r'def np_encoder\(obj\):[\s\S]*?return str\(obj\)', new_encoder.strip(), content)

    with open(file_path, 'w') as f:
        f.write(content)

fix_encoder("/Users/kovoordheeraj/Documents/google solutions updated/google_solutions-main/backend/services/store.py")
fix_encoder("/Users/kovoordheeraj/Documents/google solutions updated/fairlens-main/backend/services/store.py")
print("Encoder fixed")
