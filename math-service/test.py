import requests

url = "http://127.0.0.1:5001/derive"

data = {
    "expression": "x^2 + sin(x)"
}

response = requests.post(url, json=data)

print(response.json())