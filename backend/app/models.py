from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class AuditRecord(BaseModel):
    record_id: str
    surface: str
    timestamp: str
    diagnosis_or_score: str
    confidence: float
    action_chosen: str
    guardrail_status: str
    reasoning_trace: str
    outcome: str
    amount_recovered: float
    amount_at_risk: float
    split: str
    attempt: int
    recovery_type: Optional[str] = None
    root_cause: Optional[str] = None
    channel: Optional[str] = None
    language: Optional[str] = None
    promise_date: Optional[str] = None
    promise_status: Optional[str] = None
    recommended_action: Optional[str] = None
