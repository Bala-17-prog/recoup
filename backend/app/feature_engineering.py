def engineer_features(record):
    """
    Extracts explicit model features from the raw record.
    Normalizes numeric features.
    """
    features = {}
    
    # Amount at risk
    amount = float(record.get("amount", 0))
    features["amount_at_risk"] = amount
    features["amount_normalized"] = min(amount / 50000.0, 1.0) # Cap at 1.0
    
    # Days overdue
    days_overdue = int(record.get("days_overdue", 0)) if str(record.get("days_overdue", "0")).isdigit() else 0
    features["days_overdue"] = days_overdue
    features["days_overdue_normalized"] = min(days_overdue / 90.0, 1.0)
    
    # Retry count
    retry_count = int(record.get("retry_count", 0))
    features["retry_count"] = retry_count
    
    # Customer segment
    segment = str(record.get("customer_segment", "consumer")).lower()
    features["is_b2b"] = 1 if segment == "b2b" else 0
    features["is_premium"] = 1 if segment == "premium" else 0
    
    # Promise to pay flags
    promise_date = record.get("promise_date")
    promise_status = str(record.get("promise_status", "")).upper()
    features["promise_to_pay_flag"] = 1 if promise_date or promise_status in ["PENDING", "DUE TODAY"] else 0
    features["promise_missed_flag"] = 1 if promise_status == "MISSED" else 0
    
    # Historical success rate (mocked if not provided)
    historical_success = record.get("historical_payment_success_rate")
    if historical_success is not None:
        features["historical_payment_success_rate"] = float(historical_success)
    else:
        # If no history, assume 50%
        features["historical_payment_success_rate"] = 0.50
        
    return features
