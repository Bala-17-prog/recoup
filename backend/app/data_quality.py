def evaluate_data_quality(record):
    """
    Validates required fields and computes a data quality score.
    Returns:
    {
        "valid": bool,
        "missing_fields": list,
        "invalid_fields": list,
        "quality_score": int
    }
    """
    required = ["record_id", "amount", "recovery_type"]
    missing = []
    invalid = []
    score = 100

    # 1. Check required presence
    for req in required:
        if not record.get(req):
            missing.append(req)
            score -= 20
            
    # 2. Check amount validity
    amount = record.get("amount")
    if amount is not None:
        try:
            amt_val = float(amount)
            if amt_val <= 0:
                invalid.append("amount (must be > 0)")
                score -= 20
        except (ValueError, TypeError):
            invalid.append("amount (not numeric)")
            score -= 20
            
    # 3. Check days overdue validity
    days_overdue = record.get("days_overdue")
    if days_overdue is not None:
        try:
            do_val = int(days_overdue)
            if do_val < 0:
                invalid.append("days_overdue (cannot be negative)")
                score -= 10
        except (ValueError, TypeError):
            invalid.append("days_overdue (not integer)")
            score -= 10
            
    # 4. Check for optional fields to boost score or penalize if missing where expected
    if not record.get("customer_id"):
        score -= 5
        
    score = max(0, score)
    
    # Validation failure: must have required fields and valid amount
    is_valid = len(missing) == 0 and "amount" not in [i.split()[0] for i in invalid]
    
    return {
        "valid": is_valid,
        "missing_fields": missing,
        "invalid_fields": invalid,
        "quality_score": score
    }
