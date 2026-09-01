def get_action_reason(score, action):
    if action == "trust_promise":
        return "High recovery probability. Trust-based payment action selected."
    if score < 40 or action == "escalate_early":
        return "Low recovery probability. Escalation recommended to avoid unnecessary retries."
    if action == "gentle_nudge_1d_before":
        return "Moderate recovery probability. A low-friction reminder is preferred."
    return "Action blocked or manual review required."

def score_promise(promise):
    score = 100
    factors = []
    
    # 1. Keep Rate (Historical Data)
    if "previous_late_payments" in promise and promise["previous_late_payments"] is not None:
        late_payments = int(promise["previous_late_payments"])
        factors.append(f"• Previous failed attempts: {late_payments}")
        if late_payments > 0:
            score -= min(40, late_payments * 10)
            factors.append("• Previous payment behavior: Poor")
        else:
            factors.append("• Previous payment behavior: Good")
    else:
        history = promise.get("customer_reliability_history", {})
        if not history and "previous_late_payments" not in promise:
            score -= 20
            factors.append("• Customer/payment history: Unavailable")
        elif history:
            factors.append("• Customer/payment history: Available")
            made = history.get("past_promises_made", 0)
            kept = history.get("past_promises_kept", 0)
            avg_lateness = history.get("avg_days_late_when_kept", 0)
            typical_size = history.get("typical_payment_size", 1)
            if made > 0:
                keep_rate = kept / made
                score -= (1.0 - keep_rate) * 40
                factors.append(f"• Historical keep rate: {keep_rate*100:.0f}%")
            else:
                score -= 20
                
            if avg_lateness > 5:
                penalty = min(25, avg_lateness * 2)
                score -= penalty
                factors.append(f"• Average historical lateness: {avg_lateness} days")
                
            amount_due = promise.get("amount_due", promise.get("amount", 0))
            if typical_size > 0:
                ratio = amount_due / typical_size
                if ratio > 2.0:
                    score -= 15
                    
    # 3. Days Overdue Penalty
    days_overdue = promise.get("days_overdue_at_promise", promise.get("days_overdue", 0))
    if days_overdue > 15:
        penalty = min(20, (days_overdue - 15) * 0.5)
        score -= penalty
        factors.append(f"• Invoice age: {days_overdue} days")
            
    score = max(0, round(score))
    
    if score >= 75:
        action = "trust_promise"
    elif score >= 50:
        action = "gentle_nudge_1d_before"
    else:
        action = "escalate_early"
        
    action_reason = get_action_reason(score, action)
    reasoning = "Contributing Factors:\n" + "\n".join(factors) + f"\n\nDecision:\n\"{action_reason}\""
    
    return {
        "score": score,
        "action": action,
        "reasoning": reasoning,
        "action_reason": action_reason
    }
