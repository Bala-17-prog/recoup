import random

def diagnose_root_cause(record, features):
    recovery_type = record.get("recovery_type", "unknown")
    amount = features.get("amount_at_risk", 0)
    retry_count = features.get("retry_count", 0)
    
    cause = "unknown_error"
    confidence = 0.50
    
    if recovery_type == "PAYMENT_FAILURE":
        if retry_count > 1:
            cause = "insufficient_funds"
            confidence = 0.88
        else:
            cause = "network_timeout"
            confidence = 0.65
    elif recovery_type == "CHECKOUT_DROPOFF":
        if amount > 10000:
            cause = "price_friction"
            confidence = 0.75
        else:
            cause = "payment_method_failure"
            confidence = 0.82
    elif recovery_type == "SUBSCRIPTION_FAILURE":
        cause = "expired_payment_method"
        confidence = 0.90
    elif recovery_type == "B2B_RECEIVABLE":
        if features.get("promise_missed_flag", 0) == 1:
            cause = "promised_payment_missed"
            confidence = 0.95
        else:
            cause = "approval_delay"
            confidence = 0.70
    elif recovery_type == "MANDATE_FAILURE":
        if retry_count >= 2:
            cause = "mandate_expired"
            confidence = 0.85
        else:
            cause = "bank_unavailable"
            confidence = 0.60
            
    return cause, confidence

def generate_hinglish_voice(record, action, root_cause):
    if action not in ["b2b_voice_reminder", "checkout_reminder", "due_date_reminder"]:
        return ""
    
    amount = record.get("amount", 0)
    customer = record.get("customer_id", "Customer")
    
    if action == "b2b_voice_reminder":
        return f"Namaste {customer}, aapka invoice of Rs. {amount} pending hai. Agar koi issue hai toh please humein batayein, warna payment process kar dein."
    elif action == "checkout_reminder":
        return f"Hi {customer}, aapka cart wait kar raha hai. Payment complete karne mein koi problem aa rahi hai kya?"
    else:
        return f"Namaste {customer}, aapka Rs. {amount} ka payment due hai. Please aaj hi complete karein."

def generate_candidate_actions(recovery_type):
    """
    Returns a list of candidate actions for a given recovery type with their 
    base effectiveness modifier and cost.
    """
    candidates = [
        {"action": "no_intervention", "effectiveness": 0.10, "cost": 0.0},
        {"action": "flag_manual_review", "effectiveness": 0.85, "cost": 50.0} # Human review is expensive
    ]
    
    if recovery_type == "PAYMENT_FAILURE":
        candidates.extend([
            {"action": "immediate_retry", "effectiveness": 0.60, "cost": 2.0},
            {"action": "retry_after_24h", "effectiveness": 0.70, "cost": 1.0}
        ])
    elif recovery_type == "CHECKOUT_DROPOFF":
        candidates.extend([
            {"action": "checkout_reminder", "effectiveness": 0.40, "cost": 0.5}
        ])
    elif recovery_type == "SUBSCRIPTION_FAILURE":
        candidates.extend([
            {"action": "send_card_update_link", "effectiveness": 0.50, "cost": 0.5},
            {"action": "retry_subscription_payment", "effectiveness": 0.65, "cost": 1.5}
        ])
    elif recovery_type == "B2B_RECEIVABLE":
        candidates.extend([
            {"action": "b2b_email_reminder", "effectiveness": 0.60, "cost": 1.0},
            {"action": "b2b_whatsapp_reminder", "effectiveness": 0.75, "cost": 2.5},
            {"action": "b2b_voice_reminder", "effectiveness": 0.85, "cost": 15.0}
        ])
    elif recovery_type == "MANDATE_FAILURE":
        candidates.extend([
            {"action": "mandate_reauthorization", "effectiveness": 0.55, "cost": 1.0},
            {"action": "immediate_retry", "effectiveness": 0.60, "cost": 2.0}
        ])
    elif recovery_type == "PROMISE_TO_PAY":
        candidates.extend([
            {"action": "wait_until_promise_date", "effectiveness": 0.95, "cost": 0.0},
            {"action": "due_date_reminder", "effectiveness": 0.80, "cost": 2.5},
            {"action": "missed_promise_followup", "effectiveness": 0.60, "cost": 15.0}
        ])
        
    return candidates

def calculate_expected_value(candidates, recovery_probability, amount_at_risk):
    for c in candidates:
        ev = (recovery_probability * amount_at_risk * c["effectiveness"]) - c["cost"]
        c["expected_value"] = round(max(0, ev), 2)
    return sorted(candidates, key=lambda x: x["expected_value"], reverse=True)

def apply_policy_filters(candidates, record, features):
    """
    Business Policy filter. Returns allowed candidates and policy trace.
    """
    allowed = []
    policy_trace = []
    
    retry_count = features.get("retry_count", 0)
    days_overdue = features.get("days_overdue", 0)
    
    for c in candidates:
        action = c["action"]
        blocked = False
        reason = ""
        
        if action in ["immediate_retry", "retry_after_24h", "retry_subscription_payment"]:
            if retry_count >= 3:
                blocked = True
                reason = "Maximum retry attempts reached"
                
        elif action == "b2b_voice_reminder":
            if amount_at_risk := features.get("amount_at_risk", 0):
                if amount_at_risk < 5000:
                    blocked = True
                    reason = "Voice reminder blocked for low-value invoice"
                    
        elif action == "checkout_reminder":
            if days_overdue > 7:
                blocked = True
                reason = "Checkout reminder blocked > 7 days"
                
        elif action == "wait_until_promise_date":
            if features.get("promise_missed_flag", 0) == 1 or record.get("promise_status") == "MISSED":
                blocked = True
                reason = "Promise to pay was already missed"
                
        elif action == "b2b_email_reminder":
            if days_overdue > 30:
                blocked = True
                reason = "Email reminder blocked for invoices > 30 days overdue (requires escalation)"
                
        if blocked:
            policy_trace.append({"action": action, "status": "BLOCKED", "reason": reason})
        else:
            allowed.append(c)
            
    return allowed, policy_trace

def apply_guardrail_filters(candidates, recovery_probability, confidence_score):
    """
    Safety Guardrails (e.g. don't automate if low confidence).
    """
    allowed = []
    guardrail_trace = []
    
    for c in candidates:
        action = c["action"]
        blocked = False
        reason = ""
        
        # Don't allow automated high-friction actions if confidence is low
        if confidence_score < 0.60 and action not in ["flag_manual_review", "no_intervention", "wait_until_promise_date"]:
            blocked = True
            reason = "Confidence below automation threshold"
            
        # Protect promise to pay
        if action == "immediate_retry" and c.get("promise_to_pay_flag") == 1:
            blocked = True
            reason = "Promise-to-pay protection active"
            
        # Automation limit for high value
        amount = c.get("amount_at_risk", 0)
        if amount > 50000 and action not in ["flag_manual_review", "no_intervention"]:
            blocked = True
            reason = "Amount exceeds automated action limit (50k)"
            
        if blocked:
            guardrail_trace.append({"action": action, "status": "BLOCKED", "reason": reason})
        else:
            allowed.append(c)
            
    return allowed, guardrail_trace

def optimize_decision(record, features, model_result, old_root_cause=None):
    """
    Orchestrates candidate generation, EV calculation, policy, and guardrails.
    """
    amount = features.get("amount_at_risk", 0)
    prob = model_result["recovery_probability"]
    conf = model_result["confidence_score"]
    
    # 0. Root cause diagnosis
    root_cause, rc_conf = diagnose_root_cause(record, features)
    
    # 1. Candidates
    all_candidates = generate_candidate_actions(record.get("recovery_type", "PAYMENT_FAILURE"))
    
    # 2. Expected Value
    ev_candidates = calculate_expected_value(all_candidates, prob, amount)
    
    # 3. Policy Filter
    policy_allowed, policy_trace = apply_policy_filters(ev_candidates, record, features)
    
    # 4. Guardrail Filter
    final_candidates, guardrail_trace = apply_guardrail_filters(policy_allowed, prob, conf)
    
    # 5. Select best
    if len(final_candidates) > 0:
        best = final_candidates[0]
        selected_action = best["action"]
        expected_value = best["expected_value"]
    else:
        selected_action = "none"
        expected_value = 0.0
        
    # Check if we should escalate based on the result
    escalation_reason = None
    if selected_action == "none":
        escalation_reason = "All viable candidate actions were blocked by policy or guardrails"
    elif selected_action == "flag_manual_review":
        escalation_reason = "Manual review surfaced as highest expected value or fallback"
        
    # Formatting alternatives for UI
    rejected = []
    for c in ev_candidates:
        if c["action"] == selected_action:
            continue
        reason = "Lower expected value"
        # Check if blocked by policy
        for pt in policy_trace:
            if pt["action"] == c["action"]:
                reason = f"Policy restriction: {pt['reason']}"
        # Check if blocked by guardrail
        for gt in guardrail_trace:
            if gt["action"] == c["action"]:
                reason = f"Guardrail: {gt['reason']}"
                
        rejected.append({
            "action": c["action"],
            "expected_value": c["expected_value"],
            "reason": reason
        })
        
    hinglish_msg = generate_hinglish_voice(record, selected_action, root_cause)
    
    # Generate Explanation
    conf_str = "High" if prob >= 0.8 else "Medium" if prob >= 0.6 else "Low"
    rc_formatted = root_cause.replace("_", " ")
    action_formatted = selected_action.replace("_", " ")
    
    if escalation_reason:
        if "policy" in escalation_reason.lower() or "guardrail" in escalation_reason.lower():
            explanation = f"{conf_str} recovery probability ({int(prob*100)}%) with inferred root cause of {rc_formatted}. Automated recovery was blocked. Escalated due to: {escalation_reason}."
        else:
            explanation = f"{conf_str} recovery probability ({int(prob*100)}%) is below automation threshold. Escalated to manual review."
    else:
        explanation = f"{conf_str} recovery probability ({int(prob*100)}%) combined with a root cause of {rc_formatted}. Selected {action_formatted}. All policy and guardrails passed."
        
    return {
        "selected_action": selected_action,
        "expected_value": expected_value,
        "candidate_actions": ev_candidates,
        "policy_checks": policy_trace,
        "guardrail_checks": guardrail_trace,
        "escalation_reason": escalation_reason,
        "rejected_alternatives": rejected,
        "root_cause_inferred": root_cause,
        "root_cause_confidence": rc_conf,
        "execution_mode": "SIMULATION",
        "hinglish_message": hinglish_msg,
        "explanation": explanation
    }
