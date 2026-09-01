from pathlib import Path
import json
import random
from datetime import datetime, timedelta

def generate_universal_demo_data(num_records=50, seed=42):
    random.seed(seed)
    
    recovery_types = [
        "PAYMENT_FAILURE", 
        "CHECKOUT_DROPOFF", 
        "SUBSCRIPTION_FAILURE", 
        "B2B_RECEIVABLE", 
        "MANDATE_FAILURE", 
        "PROMISE_TO_PAY"
    ]
    
    customers = ["Acme Corp", "TechFlow Inc", "Rahul Sharma", "Priya Singh", "Global Industries", "Neo Ventures", "Amit Patel", "Sneha Gupta"]
    
    records = [
        {"record_id": "DEMO-PAYFAIL", "customer_id": "CUST-001", "customer_name": "Payment Failure Demo", "recovery_type": "PAYMENT_FAILURE", "amount": 15000, "currency": "INR", "retry_count": 0, "error_code": "insufficient_funds"},
        {"record_id": "DEMO-DROPOFF", "customer_id": "CUST-002", "customer_name": "Checkout Dropoff Demo", "recovery_type": "CHECKOUT_DROPOFF", "amount": 12500, "currency": "INR", "retry_count": 0, "abandonment_stage": "pricing_friction"},
        {"record_id": "DEMO-SUBFAIL", "customer_id": "CUST-003", "customer_name": "Sub Failure Demo", "recovery_type": "SUBSCRIPTION_FAILURE", "amount": 4500, "currency": "INR", "retry_count": 0, "sub_error": "expired_card"},
        {"record_id": "DEMO-B2BHINGLISH", "customer_id": "CUST-004", "customer_name": "B2B Hinglish Demo", "recovery_type": "B2B_RECEIVABLE", "amount": 25000, "currency": "INR", "retry_count": 1, "language": "HINGLISH", "b2b_status": "invoice_overdue", "days_overdue": 15},
        {"record_id": "DEMO-MANDATE-R0", "customer_id": "CUST-005", "customer_name": "Mandate R0 Demo", "recovery_type": "MANDATE_FAILURE", "amount": 3000, "currency": "INR", "retry_count": 0, "mandate_error": "bank_unavailable"},
        {"record_id": "DEMO-MANDATE-R1", "customer_id": "CUST-006", "customer_name": "Mandate R1 Demo", "recovery_type": "MANDATE_FAILURE", "amount": 3000, "currency": "INR", "retry_count": 1, "mandate_error": "previous_failure"},
        {"record_id": "DEMO-MANDATE-R3", "customer_id": "CUST-007", "customer_name": "Mandate R3 Demo", "recovery_type": "MANDATE_FAILURE", "amount": 3000, "currency": "INR", "retry_count": 3, "mandate_error": "mandate_expired"},
        {"record_id": "DEMO-PROMISE", "customer_id": "CUST-008", "customer_name": "Promise to Pay Demo", "recovery_type": "PROMISE_TO_PAY", "amount": 8000, "currency": "INR", "retry_count": 0, "promise_date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"), "promise_status": "PENDING"},
    ]
    
    for i in range(1, num_records - len(records) + 1):
        r_type = random.choice(recovery_types)
        amount = round(random.uniform(500, 50000), 2)
        
        record = {
            "record_id": f"INV-{1000 + i}",
            "customer_id": f"CUST-{random.randint(100, 999)}",
            "customer_name": random.choice(customers),
            "recovery_type": r_type,
            "amount": amount,
            "currency": "INR",
            "retry_count": random.randint(0, 3)
        }
        
        # Root Cause Determinism Seeds
        if r_type == "PAYMENT_FAILURE":
            record["error_code"] = random.choice(["insufficient_funds", "card_declined", "bank_timeout", "network_error", "authentication_failed"])
        elif r_type == "CHECKOUT_DROPOFF":
            record["abandonment_stage"] = random.choice(["payment_step", "pricing_friction", "session_timeout", "checkout_error"])
        elif r_type == "SUBSCRIPTION_FAILURE":
            record["sub_error"] = random.choice(["recurring_payment_failed", "expired_card", "insufficient_funds", "mandate_failed"])
        elif r_type == "B2B_RECEIVABLE":
            record["b2b_status"] = random.choice(["invoice_overdue", "payment_delayed", "disputed_invoice"])
            record["language"] = "HINGLISH" if random.random() > 0.5 else "ENGLISH"
        elif r_type == "MANDATE_FAILURE":
            record["mandate_error"] = random.choice(["mandate_failed", "mandate_expired", "retry_required"])
        elif r_type == "PROMISE_TO_PAY":
            base_date = datetime.now()
            offset = random.randint(-5, 5)
            promise_date = base_date + timedelta(days=offset)
            record["promise_date"] = promise_date.strftime("%Y-%m-%d")
            
            if offset < 0:
                record["promise_status"] = "MISSED"
            elif offset == 0:
                record["promise_status"] = "DUE TODAY"
            else:
                record["promise_status"] = "PENDING"

        # Compliance / Policy flags
        if random.random() < 0.1:
            record["compliance_flags"] = {"do_not_contact": True}
        elif random.random() < 0.15:
            record["compliance_flags"] = {"do_not_retry": True}
        else:
            record["compliance_flags"] = {}
            
        records.append(record)
        
    return records

if __name__ == "__main__":
    import os
    
    train_data = generate_universal_demo_data(50, seed=42)
    test_data = generate_universal_demo_data(30, seed=100)
    
    out_dir = Path(__file__).resolve().parent.parent / "data"
    os.makedirs(out_dir, exist_ok=True)
    
    with open(os.path.join(out_dir, "demo_data_train.json"), "w", encoding="utf-8") as f:
         json.dump(train_data, f, indent=2)
         
    with open(os.path.join(out_dir, "demo_data_test.json"), "w", encoding="utf-8") as f:
         json.dump(test_data, f, indent=2)
         
    print("Generated unified demo data.")
