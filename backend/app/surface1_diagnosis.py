def get_action_reason(confidence, action):
    if action == "trust_promise":
        return "High recovery probability. Trust-based payment action selected."
    if confidence < 0.40:
        return "Low recovery probability. Escalation recommended to avoid unnecessary retries."
    if action == "retry_after_24h":
        return "Moderate recovery probability. A low-friction retry is preferred."
    if action == "immediate_retry":
        return "Moderate recovery probability. Immediate network retry chosen."
    if action == "send_card_update_link":
        return "Card update link sent due to expired payment method."
    if action == "send_reauth_nudge":
        return "Customer re-authentication is required to proceed."
    if action == "checkout_reminder":
        return "Abandoned session detected; sending a reminder link to recover."
    if action == "retry_subscription_payment":
        return "Subscription payment scheduled for retry to avoid churn."
    if action == "b2b_email_reminder":
        return "B2B overdue invoice. Sending professional email reminder."
    if action == "b2b_whatsapp_reminder":
        return "B2B payment delayed. Sending WhatsApp message for quicker resolution."
    if action == "b2b_voice_reminder":
        return "B2B high-risk or delayed invoice. Triggering automated voice reminder."
    if action == "mandate_reauthorization":
        return "Mandate failed or expired; requesting customer re-authorization."
    if action == "wait_until_promise_date":
        return "Promise to pay active; waiting until the due date."
    if action == "due_date_reminder":
        return "Promise is due today; sending gentle reminder."
    if action == "missed_promise_followup":
        return "Promise missed. Escalating or triggering missed-promise workflow."
    return "Action blocked or manual review required."

def diagnose_record(tx):
    r_type = tx.get("recovery_type", "PAYMENT_FAILURE")
    confidence = 0.85 # Base confidence
    factors = []
    
    # Extract Root Cause based on Recovery Type
    reason = "unknown"
    if r_type == "PAYMENT_FAILURE":
        reason = tx.get("error_code") or tx.get("payment_status") or "insufficient_funds"
    elif r_type == "CHECKOUT_DROPOFF":
        reason = tx.get("abandonment_stage") or "checkout_error"
    elif r_type == "SUBSCRIPTION_FAILURE":
        reason = tx.get("sub_error") or "recurring_payment_failed"
    elif r_type == "B2B_RECEIVABLE":
        reason = tx.get("b2b_status") or "invoice_overdue"
    elif r_type == "MANDATE_FAILURE":
        reason = tx.get("mandate_error") or "mandate_failed"
    elif r_type == "PROMISE_TO_PAY":
        reason = tx.get("promise_status") or "PENDING"
        if reason == "PENDING":
            reason = "promise_created"
        elif reason == "DUE TODAY":
            reason = "promise_due"
        elif reason == "MISSED":
            reason = "promise_missed"
    
    # Simple risk adjustment
    amount = float(tx.get("amount", 0))
    amt_risk = "High" if amount > 25000 else ("Medium" if amount > 5000 else "Low")
    factors.append(f"• Amount risk: {amt_risk}")
    
    retry_count = int(tx.get("retry_count", 0))
    if retry_count == 0:
        confidence += 0.10
        factors.append("• Clean record (0 prior retries)")
    elif retry_count > 2:
        confidence -= 0.15
        factors.append(f"• High failure history ({retry_count} prior retries)")
        
    confidence = min(max(confidence, 0.0), 1.0)
    
    # Select Playbook & Channel
    playbook = "flag_manual_review"
    channel = "HUMAN"
    
    if r_type == "PAYMENT_FAILURE":
        if reason in ["insufficient_funds", "unpaid"]:
            playbook = "retry_after_24h"
            channel = "PAYMENT_RETRY"
        elif reason in ["bank_timeout", "network_error"]:
            playbook = "immediate_retry"
            channel = "PAYMENT_RETRY"
        elif reason == "card_declined":
            playbook = "flag_manual_review"
            channel = "HUMAN"
            
    elif r_type == "CHECKOUT_DROPOFF":
        playbook = "checkout_reminder"
        channel = "EMAIL"
        
    elif r_type == "SUBSCRIPTION_FAILURE":
        if reason == "expired_card":
            playbook = "send_card_update_link"
            channel = "EMAIL"
        else:
            playbook = "retry_subscription_payment"
            channel = "PAYMENT_RETRY"
            
    elif r_type == "B2B_RECEIVABLE":
        if reason == "invoice_overdue":
            playbook = "b2b_email_reminder"
            channel = "EMAIL"
        elif reason == "payment_delayed":
            playbook = "b2b_whatsapp_reminder"
            channel = "WHATSAPP"
        elif reason == "disputed_invoice":
            playbook = "b2b_voice_reminder"
            channel = "VOICE"
            
    elif r_type == "MANDATE_FAILURE":
        if reason in ["mandate_failed", "mandate_expired"]:
            playbook = "mandate_reauthorization"
            channel = "SMS"
        else:
            playbook = "immediate_retry"
            channel = "PAYMENT_RETRY"
            
    elif r_type == "PROMISE_TO_PAY":
        if reason == "promise_created":
            playbook = "wait_until_promise_date"
            channel = "NONE"
        elif reason == "promise_due":
            playbook = "due_date_reminder"
            channel = "WHATSAPP"
        elif reason == "promise_missed":
            playbook = "missed_promise_followup"
            channel = "VOICE"
    
    # Language demo (Hinglish Voice support)
    language = tx.get("language", "ENGLISH")
    if channel == "VOICE" and language == "HINGLISH":
        factors.append(f"• Language: {language} (Hinglish Voice Recovery selected)")
        
    action_reason = get_action_reason(confidence, playbook)
    reasoning = "Contributing Factors:\n" + "\n".join(factors) + f"\n\nDecision:\n\"{action_reason}\""
    
    if channel == "VOICE" and language == "HINGLISH":
        reasoning += f"\n\n[MOCK HINGLISH VOICE TRANSCRIPT]\n\"Namaste {tx.get('customer_name', 'sir')}, aapka ₹{amount} ka payment aaj due hai. Kya hum payment link share kar sakte hain?\""
    
    return {
        "diagnosis": reason,
        "root_cause": reason,
        "confidence": round(confidence, 2),
        "playbook": playbook,
        "channel": channel,
        "language": language,
        "reasoning": reasoning,
        "action_reason": action_reason
    }
