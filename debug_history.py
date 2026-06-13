import sys
import json
import math
from fastapi.encoders import jsonable_encoder

def test_serialization():
    data = [{"overall_score": float('nan')}]
    try:
        res = jsonable_encoder(data)
        print("Success:", res)
    except Exception as e:
        print("Error:", type(e), str(e))

test_serialization()
