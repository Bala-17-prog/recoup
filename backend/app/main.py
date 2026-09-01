from fastapi import FastAPI, BackgroundTasks, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.database import get_audit_logs, init_db
from app.evaluator import run_evaluation
from pydantic import BaseModel
import sqlite3
import pandas as pd
import numpy as np
import io
import math
from pathlib import Path

# Compute dynamic DB path relative to the project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = PROJECT_ROOT / "data"
DB_PATH = DATA_DIR / "recoup.db"

app = FastAPI(title="Recoup API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/parse-file")
async def parse_file(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload CSV or XLSX.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
        
    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
        
    columns = df.columns.tolist()
    # Return first 5 rows and all columns, and also the raw JSON data so frontend can hold it
    # We replace NaN with None for JSON serialization
    df = df.replace({np.nan: None})
    records = df.to_dict(orient="records")
    
    return {
        "columns": columns,
        "preview": records[:5],
        "records": records
    }

class MappingRequest(BaseModel):
    records: list
    mapping: dict

@app.post("/api/validate-mapping")
def validate_mapping(req: MappingRequest):
    records = req.records
    mapping = req.mapping
    
    valid_records = []
    invalid_records = []
    
    required_fields = ["record_id", "amount"]
    
    for r in records:
        mapped_record = {}
        for internal_field, uploaded_column in mapping.items():
            if uploaded_column and uploaded_column in r:
                mapped_record[internal_field] = r[uploaded_column]
                
        # Validation checks
        is_valid = True
        reason = ""
        
        # Safe inferences for missing optional fields
        mapped_record.setdefault("retry_count", 0)
        mapped_record.setdefault("days_overdue", 0)
        mapped_record.setdefault("recovery_type", "PAYMENT_FAILURE")
        mapped_record.setdefault("customer_id", mapped_record.get("record_id", "UNKNOWN"))
        mapped_record.setdefault("promise_status", "NONE")
        mapped_record.setdefault("language", "ENGLISH")
        
        # 1. Missing required fields
        for req_f in required_fields:
            if not mapped_record.get(req_f):
                is_valid = False
                reason = f"Missing required column: {req_f}"
                break
                
        # 2. Invalid or negative amount
        if is_valid:
            try:
                import re
                amt_str = str(mapped_record["amount"])
                amt_str = re.sub(r'[^\d.-]', '', amt_str) # allow negative sign for check
                amt = float(amt_str) if amt_str else 0.0
                if amt < 0:
                    is_valid = False
                    reason = "Negative invoice amounts are not allowed"
                elif amt == 0:
                    is_valid = False
                    reason = "Zero amount invoice"
                mapped_record["amount"] = amt
            except (ValueError, TypeError):
                is_valid = False
                reason = "Invalid numeric invoice amount"
                
        # 3. Invalid days overdue
        if is_valid and "days_overdue" in mapped_record:
            try:
                val = mapped_record["days_overdue"]
                if val is not None and str(val).strip():
                    mapped_record["days_overdue"] = int(val)
                    if mapped_record["days_overdue"] < 0:
                        is_valid = False
                        reason = "days_overdue cannot be negative"
            except (ValueError, TypeError):
                is_valid = False
                reason = "Invalid days_overdue (must be integer)"
                
        # 4. Invalid retry count
        if is_valid and "retry_count" in mapped_record:
            try:
                val = mapped_record["retry_count"]
                if val is not None and str(val).strip():
                    mapped_record["retry_count"] = int(val)
                    if mapped_record["retry_count"] < 0:
                        is_valid = False
                        reason = "retry_count cannot be negative"
                else:
                    mapped_record["retry_count"] = 0
            except (ValueError, TypeError):
                is_valid = False
                reason = "Invalid retry_count (must be integer)"
        
        # 5. Promise Date parsing
        if is_valid and "promise_date" in mapped_record:
            val = mapped_record["promise_date"]
            if val is not None and str(val).strip() and str(val).lower() != "nan":
                try:
                    dt = pd.to_datetime(str(val))
                    mapped_record["promise_date"] = dt.strftime("%Y-%m-%d")
                    mapped_record["promise_status"] = "ACTIVE"
                except Exception:
                    mapped_record["promise_date"] = ""
            else:
                mapped_record["promise_date"] = ""
                
        if is_valid:
            valid_records.append(mapped_record)
        else:
            invalid_records.append({"record": mapped_record, "reason": reason})
            
    # Check duplicates
    seen_ids = set()
    final_valid = []
    for vr in valid_records:
        rec_id = vr["record_id"]
        if rec_id in seen_ids:
            invalid_records.append({"record": vr, "reason": "Duplicate record_id"})
        else:
            seen_ids.add(rec_id)
            final_valid.append(vr)
            
    return {
        "total": len(records),
        "valid_count": len(final_valid),
        "invalid_count": len(invalid_records),
        "valid_records": final_valid,
        "invalid_records": invalid_records
    }

from typing import Optional

class SimulateRequest(BaseModel):
    is_test: bool = False
    use_company_data: bool = False
    company_data: Optional[list] = None

latest_metrics = None

import uuid

@app.post("/api/simulate-batch")
def simulate_batch(req: SimulateRequest):
    global latest_metrics
    
    # We no longer drop the table, ensuring safe concurrent writes
    init_db()
    
    run_id = str(uuid.uuid4())
    
    latest_metrics = run_evaluation(
        run_id=run_id, 
        is_test=req.is_test, 
        company_data=req.company_data if req.use_company_data else None
    )
    latest_metrics["run_id"] = run_id
    
    return get_metrics(run_id)

@app.get("/api/audit-trail")
def get_audit(split: str = None, run_id: str = None):
    logs = get_audit_logs(split, run_id)
    return logs

@app.get("/api/metrics")
def get_metrics(run_id: str = None):
    global latest_metrics
    if latest_metrics:
        # Also need exceptions derived from db but split by train/held_out
        logs = get_audit_logs(run_id=run_id if run_id else latest_metrics.get("run_id"))
        train_exceptions = [log for log in logs if log["split"] == "train" and log["outcome"] != "recovered" and ("Attempt 1/" in log["reasoning_trace"] or log["attempt"] == 0)]
        held_out_exceptions = [log for log in logs if log["split"] == "held_out" and log["outcome"] != "recovered" and ("Attempt 1/" in log["reasoning_trace"] or log["attempt"] == 0)]
        
        # Deduplicate exceptions by keeping the max attempt or final decision
        def get_final_exceptions(ex_list):
            final = {}
            for e in ex_list:
                if e["record_id"] not in final or e["attempt"] > final[e["record_id"]]["attempt"]:
                    final[e["record_id"]] = e
            return list(final.values())

        latest_metrics["train"]["exceptions"] = get_final_exceptions([log for log in logs if log["split"] == "train" and log["outcome"] != "recovered"])
        latest_metrics["held_out"]["exceptions"] = get_final_exceptions([log for log in logs if log["split"] == "held_out" and log["outcome"] != "recovered"])
        return latest_metrics
    return {"train": {}, "held_out": {}}

