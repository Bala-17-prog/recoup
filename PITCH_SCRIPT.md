# Recoup: AI Revenue Recovery

## 5-Minute Pitch Script

### 1. The Problem
Failed payments and broken promises are black holes for revenue. Legacy retry logic is blind—it bombards customers with retries until cards are blocked, or simply gives up. We need an autonomous agent that acts like a senior collections officer: one that diagnoses the root cause, predicts customer behavior, respects compliance flags, and acts decisively.

### 2. The Architecture
Recoup operates on two surfaces: Payment Failure Recovery and Promise-to-Pay tracking. It uses a probabilistic logic engine to score reliability and confidence. More importantly, it runs inside a strict Guardrail layer: all actions are bounded by compliance blocks, maximum retry limits, and confidence gating. If confidence is too low, it stops and escalates to a human.

### 3. Live Demo
*(Switch to Dashboard)*
Here is the Recoup dashboard. We can switch between Train and Held-Out Test batches. You immediately see the Total at Risk versus Total Recovered. The Audit Trail table shows the step-by-step reasoning for every single action taken.

### 4. The Numbers (Test Batch)
On our held-out test batch, the numbers speak for themselves. We didn't adjust thresholds to make it look perfect. We had an exact recovery rate as shown, and the rest? They didn't vanish. Look at the Guardrail Proof Panel: X blocked by policy, Y escalated, Z stopped by max retries. And here is our Honest Exception List showing exactly why unrecovered revenue failed.

### 5. What it doesn't do yet
We haven't integrated real-time LLM chat for direct customer negotiation yet, and the models are trained on synthetic data. But the architecture is ready for Razorpay's live webhooks today.
