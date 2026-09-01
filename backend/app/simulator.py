import hashlib

ENGINE_SEED = "RECOUP-DEMO-SEED-2026"

MAX_ATTEMPTS = {
    "gentle_nudge_1d_before": 1,
    "immediate_retry": 1,
    "retry_after_24h": 2,
    "send_reauth_nudge": 2,
    "send_card_update_link": 2,
    "trust_promise": 1,
    "escalate_early": 0,
    "flag_manual_review": 0,
    "checkout_reminder": 2,
    "retry_subscription_payment": 3,
    "b2b_email_reminder": 3,
    "b2b_whatsapp_reminder": 2,
    "b2b_voice_reminder": 2,
    "mandate_reauthorization": 2,
    "wait_until_promise_date": 1,
    "due_date_reminder": 1,
    "missed_promise_followup": 2,
    "none": 0
}

def deterministic_random(key: str) -> float:
    """Returns a deterministic float between 0.0 and 1.0 based on the key."""
    hash_digest = hashlib.sha256(key.encode('utf-8')).hexdigest()
    # Take first 8 chars (32 bits) and convert to float
    val = int(hash_digest[:8], 16)
    return val / 0xffffffff

def simulate_outcome(action, record, attempt_index=0):
    # Simulate success probability based on action
    success_prob = 0.50 # default
    
    if action == "retry_after_24h":
        success_prob = 0.65
    elif action == "immediate_retry":
        success_prob = 0.50
    elif action == "send_card_update_link":
        success_prob = 0.30
    elif action == "send_reauth_nudge":
        success_prob = 0.45
    elif action == "checkout_reminder":
        success_prob = 0.55
    elif action == "retry_subscription_payment":
        success_prob = 0.60
    elif action == "b2b_email_reminder":
        success_prob = 0.40
    elif action == "b2b_whatsapp_reminder":
        success_prob = 0.65
    elif action == "b2b_voice_reminder":
        success_prob = 0.70
    elif action == "mandate_reauthorization":
        success_prob = 0.45
    elif action == "wait_until_promise_date":
        # Promise to pay wait
        if record.get("promise_status") == "DUE TODAY":
            success_prob = 0.80
        elif record.get("promise_status") == "MISSED":
            success_prob = 0.10
        else:
            success_prob = 0.0 # PENDING means it hasn't reached the date
    elif action == "due_date_reminder":
        success_prob = 0.85
    elif action == "missed_promise_followup":
        success_prob = 0.40
    elif action in ["trust_promise"]:
        success_prob = 0.85
    elif action in ["none", "escalate_early", "flag_manual_review"]:
        success_prob = 0.0

    record_id = record.get("record_id", "unknown")
    failure_reason = record.get("recovery_type", "unknown")
    
    key = f"{ENGINE_SEED}:execution:{record_id}:{action}:{failure_reason}:{attempt_index}"
    rand_val = deterministic_random(key)
    
    is_success = rand_val < success_prob
    if is_success:
        return "recovered"
    return "not_recovered"
