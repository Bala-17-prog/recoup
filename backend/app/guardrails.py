from app.config import CONFIDENCE_THRESHOLD, MAX_PAYMENT_RETRIES, MAX_PROMISE_TOUCHES

LOW_CONFIDENCE_THRESHOLD = 0.40

def check_guardrails(record, diagnosis_result, is_payment=True):
    flags = record.get("compliance_flags", {})
    
    if flags.get("do_not_contact", False):
        return {"status": "blocked_by_policy", "reason": "Blocked by do_not_contact flag"}
    if is_payment and flags.get("do_not_retry", False):
        return {"status": "blocked_by_policy", "reason": "Blocked by do_not_retry flag"}
        
    confidence = diagnosis_result.get("confidence", 1.0)
    if confidence < LOW_CONFIDENCE_THRESHOLD:
        return {"status": "escalated_to_human", "reason": f"Low recovery confidence ({confidence})"}
        
    if is_payment:
        if record.get("retry_count", 0) >= MAX_PAYMENT_RETRIES:
            return {"status": "escalated_to_human", "reason": "Max retries exceeded"}
            
    return {"status": "allowed", "reason": "Passed all guardrails"}

