import requests
import json

# 1. Parse File
files = {'file': open('d:/Projects/Recoup/sample_company_invoices.csv', 'rb')}
res1 = requests.post("http://localhost:8000/api/parse-file", files=files)
data1 = res1.json()

# 2. Validate Mapping
mapping = {
    "invoice_id": "Invoice Number",
    "amount": "Total Value",
    "days_overdue": "Days Overdue",
    "previous_late_payments": "Historical Late Payments",
    "payment_status": "Payment Status"
}

res2 = requests.post("http://localhost:8000/api/validate-mapping", json={
    "records": data1["records"],
    "mapping": mapping
})
data2 = res2.json()
valid_records = data2["valid_records"]

payload = {
    "is_test": False,
    "use_company_data": True,
    "company_data": valid_records
}

# 3. Simulate Runs
print("Run 1...")
requests.post("http://localhost:8000/api/simulate-batch", json=payload)
metrics1 = requests.get("http://localhost:8000/api/metrics").json()
audit1 = requests.get("http://localhost:8000/api/audit-trail").json()

print("Run 2...")
requests.post("http://localhost:8000/api/simulate-batch", json=payload)
metrics2 = requests.get("http://localhost:8000/api/metrics").json()
audit2 = requests.get("http://localhost:8000/api/audit-trail").json()

print("Run 3...")
requests.post("http://localhost:8000/api/simulate-batch", json=payload)
metrics3 = requests.get("http://localhost:8000/api/metrics").json()
audit3 = requests.get("http://localhost:8000/api/audit-trail").json()

print("--- RESULTS ---")
def compare_audit(a1, a2):
    if len(a1) != len(a2): return False
    for i in range(len(a1)):
        d1 = {k: v for k, v in a1[i].items() if k != 'timestamp'}
        d2 = {k: v for k, v in a2[i].items() if k != 'timestamp'}
        if d1 != d2:
            print("Diff Audit", i)
            print("1:", d1)
            print("2:", d2)
            return False
    return True

audit_match = compare_audit(audit1, audit2) and compare_audit(audit2, audit3)

print("--- RESULTS ---")
print(f"Metrics 1 == 2 == 3: {metrics1 == metrics2 and metrics2 == metrics3}")
print(f"Audit 1 == 2 == 3: {audit_match}")

if metrics1 == metrics2 == metrics3 and audit_match:
    print(f"Total at Risk: {metrics1['total_at_risk']}")
    print(f"Total Recovered: {metrics1['total_recovered']}")
    print(f"Recovery Rate: {(metrics1['total_recovered']/metrics1['total_at_risk'])*100:.2f}%")
    print(f"Exceptions: {len(metrics1['honest_exceptions'])}")
    print(f"Total Audit Trail Records: {len(audit1)}")
else:
    print("M1:", metrics1)
    print("M2:", metrics2)

