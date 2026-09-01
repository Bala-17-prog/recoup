def calculate_recovery_probability(features, root_cause, recovery_type):
    """
    Explainable Recovery Scoring Model.
    Calculates P(recovery) based on explicit features.
    """
    # Base probability
    prob = 0.50
    top_factors = []
    negative_factors = []
    
    # 1. Historical success
    hist = features.get("historical_payment_success_rate", 0.5)
    if hist > 0.8:
        prob += 0.20
        top_factors.append(f"Previous payment success: {int(hist*100)}%")
    elif hist < 0.3:
        prob -= 0.15
        negative_factors.append(f"Low historical success: {int(hist*100)}%")
        
    # 2. Retry Count
    retries = features.get("retry_count", 0)
    if retries == 0:
        prob += 0.10
        top_factors.append("Low retry count (0)")
    elif retries >= 3:
        prob -= 0.20
        negative_factors.append(f"High failure history ({retries} prior retries)")
        
    # 3. Promise to Pay
    if features.get("promise_to_pay_flag", 0) == 1:
        prob += 0.15
        top_factors.append("Active promise-to-pay exists")
    if features.get("promise_missed_flag", 0) == 1:
        prob -= 0.25
        negative_factors.append("Broken promise-to-pay")
        
    # 4. Days Overdue
    do = features.get("days_overdue", 0)
    if do > 30:
        prob -= 0.10
        negative_factors.append("Invoice severely overdue (>30 days)")
        
    # 5. Root Cause specifics
    if root_cause in ["insufficient_funds", "card_declined", "mandate_failed"]:
        prob -= 0.05
    if root_cause in ["network_error", "bank_timeout", "checkout_error"]:
        prob += 0.05
        top_factors.append("Failure likely transient (network/timeout)")
        
    # Ensure bounds
    prob = max(0.01, min(0.99, prob))
    
    # Calculate Decision Confidence
    # Confidence is lower if we have missing history or it's a completely new root cause
    confidence_score = 0.90
    if features.get("historical_payment_success_rate") == 0.5 and retries == 0:
        confidence_score -= 0.20 # Less confident on new records with no history
    if do > 60:
        confidence_score -= 0.10 # Less confident on very old debt
        
    decision_confidence = "HIGH"
    if confidence_score < 0.6:
        decision_confidence = "LOW"
    elif confidence_score < 0.8:
        decision_confidence = "MEDIUM"
        
    return {
        "recovery_probability": round(prob, 3),
        "decision_confidence": decision_confidence,
        "confidence_score": round(confidence_score, 3),
        "top_positive_factors": top_factors,
        "top_negative_factors": negative_factors
    }
