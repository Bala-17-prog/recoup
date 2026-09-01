import requests
import json
import sqlite3
from pathlib import Path

def run_test(name, data):
    print(f'\n--- RUNNING {name} ---')
    payload = {
        'is_test': False,
        'use_company_data': True,
        'company_data': data
    }
    val_payload = {
        "records": data,
        "mapping": {
            "record_id": "record_id",
            "amount": "amount",
            "retry_count": "retry_count",
            "recovery_type": "recovery_type",
            "payment_status": "payment_status",
            "days_overdue": "days_overdue",
            "promise_date": "promise_date"
        }
    }
    val_res = requests.post('http://localhost:8000/api/validate-mapping', json=val_payload)
    valid_data = val_res.json().get('valid_records', [])

    payload = {
        'is_test': False,
        'use_company_data': True,
        'company_data': valid_data
    }
    res = requests.post('http://localhost:8000/api/simulate-batch', json=payload)
    metrics = res.json()
    
    db_path = Path(__file__).resolve().parent.parent / "data" / "recoup.db"
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM audit_log WHERE run_id = ?', (metrics.get('run_id'),))
    logs = [dict(r) for r in c.fetchall()]
    conn.close()
    
    print(f"Total dataset sizes reported: {metrics.get('dataset_sizes', {})}")
    print(f"Total audit logs stored: {len(logs)}")
    return metrics, logs

# TEST DATASETS
DATASET_A = [
  {"record_id": "TEST-A-001", "amount": 1000, "recovery_type": "PAYMENT_FAILURE", "retry_count": 0, "payment_status": "FAILED", "days_overdue": 0},
  {"record_id": "TEST-A-002", "amount": 6000, "recovery_type": "B2B_RECEIVABLE", "retry_count": 1, "payment_status": "OVERDUE", "days_overdue": 15}
]

DATASET_B = [
  {"record_id": "MANDATE-001", "amount": 10000, "recovery_type": "MANDATE_FAILURE", "retry_count": 0, "payment_status": "FAILED", "days_overdue": 0},
  {"record_id": "MANDATE-002", "amount": 10000, "recovery_type": "MANDATE_FAILURE", "retry_count": 1, "payment_status": "FAILED", "days_overdue": 0},
  {"record_id": "MANDATE-003", "amount": 10000, "recovery_type": "MANDATE_FAILURE", "retry_count": 2, "payment_status": "FAILED", "days_overdue": 0},
  {"record_id": "MANDATE-004", "amount": 10000, "recovery_type": "MANDATE_FAILURE", "retry_count": 3, "payment_status": "FAILED", "days_overdue": 0},
  {"record_id": "PROMISE-001", "amount": 500, "recovery_type": "PROMISE_TO_PAY", "retry_count": 0, "payment_status": "OVERDUE", "days_overdue": 5, "promise_date": "2026-12-01"}
]

DATASET_C = [
  {"record_id": "INVALID-RETRY-01", "amount": 1000, "recovery_type": "PAYMENT_FAILURE", "retry_count": "abc"},
  {"record_id": "INVALID-RETRY-02", "amount": 1000, "recovery_type": "PAYMENT_FAILURE", "retry_count": -1},
  {"record_id": "INVALID-RETRY-03", "amount": 1000, "recovery_type": "PAYMENT_FAILURE", "retry_count": 1.5},
  {"record_id": "INVALID-RETRY-04", "amount": 1000, "recovery_type": "PAYMENT_FAILURE"},
  {"record_id": "INVALID-RETRY-05", "amount": 1000, "recovery_type": "PAYMENT_FAILURE", "retry_count": ""}
]

print("Starting isolation and integration tests...")

# 1. Run Dataset A
metrics_A, logs_A = run_test("DATASET A", DATASET_A)
assert len(logs_A) == 2, "Dataset A should have exactly 2 records"
print("Dataset A B2B Hinglish Test:")
b2b = [l for l in logs_A if l["recovery_type"] == "B2B_RECEIVABLE"][0]
print(f" -> {b2b['hinglish_message']}")
assert b2b["hinglish_message"], "Hinglish message not generated!"

# 2. Run Dataset B
metrics_B, logs_B = run_test("DATASET B", DATASET_B)
assert len(logs_B) == 5, f"Dataset B should have exactly 5 records, got {len(logs_B)}"
assert metrics_B["dataset_sizes"]["total"] == 5, "Total records not properly aggregated"

print("\nVerifying Dataset Isolation:")
ids_in_B = [l["record_id"] for l in logs_B]
assert "TEST-A-001" not in ids_in_B, "Dataset A leaked into Dataset B!"
print(" -> Isolation passed. Dataset A is eradicated.")

print("\nVerifying Mandate Retry State Machine (retry counts 0, 1, 2, 3):")
for log in logs_B:
    if log["recovery_type"] == "MANDATE_FAILURE":
        retry_num = log["record_id"].split("-")[1]
        print(f"DEBUG: {log['retry_sequence_state']} action={log['action_chosen']}"); seq = json.loads(log["retry_sequence_state"] if log["retry_sequence_state"] else "[]")
        print(f"Record {log['record_id']} (retry_count {int(retry_num)-1}):")
        for step in seq:
            print(f"  - Attempt {step['attempt']}: {step['action']} -> {step['status']}")

print("\nVerifying Promise-to-Pay:")
prom = [l for l in logs_B if l["record_id"] == "PROMISE-001"][0]
print(f" -> Preserved promise_date: {prom['promise_date']}")
assert prom['promise_date'] == "2026-12-01"

# 3. Run Dataset C (Invalid retries)
metrics_C, logs_C = run_test("DATASET C (Invalid Retries)", DATASET_C)
print("\nVerifying invalid retry_count parsing:")
for log in logs_C:
    print(f" -> {log['record_id']} parsed retry_count as {log['retry_count']}")
    expected = 1 if log['record_id'] == 'INVALID-RETRY-03' else 0
    assert log["retry_count"] == expected, f"Expected {expected} for {log['record_id']}, got {log['retry_count']}"

print("\nVerifying Calculation Honesty:")
ai_proj = metrics_C["train"]["strategies"]["recoup_ai"]["projected_recovery"]
ab_full = metrics_C["train"]["ablation_simulation"]["full_model"]
print(f" -> Recoup AI Strategy EV = {ai_proj}")
print(f" -> Feature Ablation EV = {ab_full}")
assert abs(ai_proj - ab_full) < 0.01, "Strategy and Ablation calculations diverge!"

print("\nAll integration tests passed successfully.")
