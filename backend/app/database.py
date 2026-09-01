import sqlite3
import json
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
DB_PATH = str(DATA_DIR / "recoup.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id TEXT,
            record_id TEXT,
            surface TEXT,
            timestamp TEXT,
            diagnosis_or_score TEXT,
            confidence REAL,
            action_chosen TEXT,
            guardrail_status TEXT,
            reasoning_trace TEXT,
            outcome TEXT,
            amount_recovered REAL,
            amount_at_risk REAL,
            split TEXT,
            attempt INTEGER,
            recovery_type TEXT,
            root_cause TEXT,
            channel TEXT,
            language TEXT,
            promise_date TEXT,
            promise_status TEXT,
            retry_count INTEGER,
            recommended_action TEXT,
            model_version TEXT,
            feature_snapshot TEXT,
            expected_value REAL,
            decision_confidence TEXT,
            candidate_actions TEXT,
            policy_checks TEXT,
            guardrail_checks TEXT,
            root_cause_confidence REAL,
            execution_mode TEXT,
            hinglish_message TEXT,
            retry_sequence_state TEXT,
            explanation TEXT
        )
    """)
    conn.commit()
    conn.close()

def log_audit(record, run_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        INSERT INTO audit_log (
            run_id, record_id, surface, timestamp, diagnosis_or_score, confidence, action_chosen, guardrail_status, 
            reasoning_trace, outcome, amount_recovered, amount_at_risk, split, attempt, 
            recovery_type, root_cause, channel, language, promise_date, promise_status, retry_count, recommended_action,
            model_version, feature_snapshot, expected_value, decision_confidence, candidate_actions, policy_checks, guardrail_checks,
            root_cause_confidence, execution_mode, hinglish_message, retry_sequence_state, explanation
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        run_id, record.get("record_id"), record.get("surface"), record.get("timestamp"),
        record.get("diagnosis_or_score", ""), record.get("confidence", 0.0),
        record.get("action_chosen", ""), record.get("guardrail_status", ""),
        record.get("reasoning_trace", ""), record.get("outcome", ""),
        record.get("amount_recovered", 0.0), record.get("amount_at_risk", 0.0),
        record.get("split", "train"), record.get("attempt", 1),
        record.get("recovery_type", "unknown"), record.get("root_cause", "unknown"),
        record.get("channel", "unknown"), record.get("language", "unknown"),
        record.get("promise_date", ""), record.get("promise_status", ""),
        record.get("retry_count", 0),
        record.get("recommended_action", "unknown"), record.get("model_version", "v1.0"),
        record.get("feature_snapshot", ""), record.get("expected_value", 0.0),
        record.get("decision_confidence", ""), record.get("candidate_actions", ""),
        record.get("policy_checks", ""), record.get("guardrail_checks", ""),
        record.get("root_cause_confidence", 0.0), record.get("execution_mode", "SIMULATION"),
        record.get("hinglish_message", ""), record.get("retry_sequence_state", ""),
        record.get("explanation", "")
    ))
    conn.commit()
    conn.close()

def get_audit_logs(split=None, run_id=None):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    query = "SELECT * FROM audit_log"
    params = []
    conditions = []
    
    if split:
        conditions.append("split = ?")
        params.append(split)
    if run_id:
        conditions.append("run_id = ?")
        params.append(run_id)
        
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
        
    query += " ORDER BY id DESC"
    
    c.execute(query, tuple(params))
    rows = [dict(row) for row in c.fetchall()]
    conn.close()
    return rows
