import requests
import json

files = {'file': ('test.csv', 'age,income,gender,approved\n25,50000,Male,Yes\n30,60000,Female,No\n', 'text/csv')}
data = {
    'sensitive_attributes': 'gender',
    'target_column': 'approved',
    'positive_label': 'Yes'
}

response = requests.post('http://127.0.0.1:8001/audit/run', files=files, data=data)
print(response.status_code)
print(response.text)
