from pathlib import Path
import json
import os
import random

def process_file(path, is_payment=True):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    if not data:
        return
        
    # Reset random seed for determinism across re-runs
    random.seed(42 + len(data))
    
    for record in data:
        r = random.random()
        
        if is_payment:
            if r < 0.10:
                # 10%: Trigger Max Retries
                record["retry_count"] = 3
            elif r < 0.20:
                # 10%: Trigger Low Confidence
                record["customer_payment_history"] = {
                    "total_transactions": 0,
                    "past_success_rate": 0.0
                }
            elif r < 0.25:
                # 5%: Trigger Policy Block
                if "compliance_flags" not in record:
                    record["compliance_flags"] = {}
                record["compliance_flags"]["do_not_contact"] = True
        else:
            # Promises
            if r < 0.10:
                # 10%: Trigger Low Score
                record["customer_reliability_history"] = {
                    "past_promises_made": 5,
                    "past_promises_kept": 0,
                    "avg_days_late_when_kept": 10,
                    "typical_payment_size": 100
                }
                record["days_overdue_at_promise"] = 30
                record["amount_due"] = 500
            elif r < 0.15:
                # 5%: Trigger Policy Block
                if "compliance_flags" not in record:
                    record["compliance_flags"] = {}
                record["compliance_flags"]["do_not_contact"] = True

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def main():
    base = Path(__file__).resolve().parent.parent / "data"
    process_file(os.path.join(base, "failed_transactions_test.json"), True)
    process_file(os.path.join(base, "failed_transactions_train.json"), True)
    process_file(os.path.join(base, "promise_to_pay_test.json"), False)
    process_file(os.path.join(base, "promise_to_pay_train.json"), False)
    print("Edge cases injected successfully.")

if __name__ == "__main__":
    main()
