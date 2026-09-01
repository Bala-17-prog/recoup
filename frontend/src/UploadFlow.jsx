import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, ArrowRight, XCircle, FileText, Database } from 'lucide-react';

const API_BASE = "http://localhost:8000/api";

const REQUIRED_FIELDS = [
    { key: "record_id", label: "Record ID / Invoice ID / Ref" },
    { key: "amount", label: "Value / Amount" },
    { key: "recovery_type", label: "Recovery Type (Optional)" },
    { key: "customer_id", label: "Customer ID (Optional)" },
    { key: "payment_status", label: "Payment Status (Optional)" },
    { key: "subscription_status", label: "Subscription Status (Optional)" },
    { key: "checkout_status", label: "Checkout Status (Optional)" },
    { key: "mandate_status", label: "Mandate Status (Optional)" },
    { key: "days_overdue", label: "Days Overdue (Optional)" },
    { key: "retry_count", label: "Retry Count (Optional)" },
    { key: "promise_date", label: "Promise Date (Optional)" },
    { key: "failure_reason", label: "Failure Reason (Optional)" },
    { key: "channel", label: "Channel (Optional)" },
    { key: "language", label: "Language (Optional)" },
];

export default function UploadFlow({ onComplete, onCancel, onTryDemo }) {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    
    // Mapping state
    const [mapping, setMapping] = useState({});
    
    // Validation state
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState(null);
    const [error, setError] = useState("");

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        setError("");
        
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        try {
            const res = await fetch(`${API_BASE}/parse-file`, {
                method: "POST",
                body: formData
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Upload failed");
            }
            const data = await res.json();
            setParsedData(data);
            
            // Strictly map exact known columns to prevent mis-mapping (e.g. Client ID -> Invoice ID)
            const initialMapping = {};
            const exactMatches = {
                "Invoice Number": "record_id",
                "Record ID": "record_id",
                "Invoice ID": "record_id",
                "Total Value": "amount",
                "Amount": "amount",
                "Value": "amount",
                "Days Overdue": "days_overdue",
                "Payment Status": "payment_status",
                "Checkout Status": "checkout_status",
                "Subscription Status": "subscription_status",
                "Mandate Status": "mandate_status",
                "Promise Date": "promise_date",
                "promiseDate": "promise_date",
                "promise date": "promise_date",
                "promise_date": "promise_date",
                "Failure Reason": "failure_reason",
                "Recovery Type": "recovery_type",
                "Retry Count": "retry_count",
                "retry_count": "retry_count",
                "Retry Attempts": "retry_count",
                "Attempts": "retry_count",
                "Language": "language",
                "Channel": "channel"
            };
            
            data.columns.forEach(c => {
                // If it's an exact known match, map it
                if (exactMatches[c]) {
                    initialMapping[exactMatches[c]] = c;
                } else {
                    // Try to guess gracefully if it hasn't been mapped yet, but be strict about IDs
                    REQUIRED_FIELDS.forEach(f => {
                        if (!initialMapping[f.key]) {
                            const cLower = c.toLowerCase();
                            const fLower = f.key.replace(/_/g, " ");
                            // Prevent "Client ID" from matching "Record ID"
                            if (cLower.includes(fLower) && !cLower.includes("client") && !cLower.includes("vendor")) {
                                initialMapping[f.key] = c;
                            }
                        }
                    });
                }
            });
            setMapping(initialMapping);
            setStep(2);
        } catch (err) {
            setError(err.message);
        }
        setUploading(false);
    };

    const handleValidate = async () => {
        if (!mapping.record_id || !mapping.amount) {
            setError("Record ID / Invoice ID and Amount are required fields.");
            return;
        }
        setError("");
        setValidating(true);
        try {
            const res = await fetch(`${API_BASE}/validate-mapping`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    records: parsedData.records,
                    mapping: mapping
                })
            });
            if (!res.ok) {
                throw new Error("Validation failed on the server.");
            }
            const data = await res.json();
            setValidationResult(data);
            setStep(3);
        } catch (err) {
            setError(err.message);
        }
        setValidating(false);
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 bg-slate-900/60 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/80">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <UploadCloud className="text-blue-400" /> Upload Company Data
                </h2>
                <button onClick={onCancel} className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-wider">Cancel</button>
            </div>
            
            <div className="p-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="text-red-400 shrink-0" size={20} />
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}

                {/* STEP 1: UPLOAD */}
                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-200 mb-3">Upload a CSV containing payment, invoice, retry, and recovery information.</h3>
                            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                                The engine requires basic details like Record ID and Amount. For advanced recovery scenarios, include these columns:
                            </p>
                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-2">
                                    <FileText size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-300">Payment Status, Checkout Status, or Subscription Status</p>
                                        <p className="text-[10px] text-slate-500">To trigger drop-off or subscription failure recovery.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <FileText size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-300">Retry Count & Mandate Status</p>
                                        <p className="text-[10px] text-slate-500">To trigger the Mandate Retry Sequencer policy escalations.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <FileText size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-300">Promise Date</p>
                                        <p className="text-[10px] text-slate-500">To populate the Promise-to-Pay tracker.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-slate-950 rounded-xl border border-white/5">
                                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Don't have a CSV ready?</p>
                                <button onClick={onTryDemo} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors text-sm">
                                    <Database size={16} /> Try Demo Data Instead
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-center flex flex-col justify-center">
                            <div className="p-12 border-2 border-dashed border-white/10 rounded-2xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all relative group">
                                <input 
                                    type="file" 
                                    accept=".csv, .xlsx" 
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
                                />
                                <div className="flex flex-col items-center gap-4 relative z-0">
                                    <div className="p-4 bg-blue-500/10 rounded-full group-hover:bg-blue-500/20 transition-colors">
                                        <UploadCloud size={40} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-200">Drag & Drop or Click</h3>
                                        <p className="text-slate-400 text-sm mt-1">Select your Company Data file</p>
                                    </div>
                                    {uploading && <div className="text-blue-400 text-sm font-bold animate-pulse mt-4">Parsing file...</div>}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-6 font-medium">
                                <span className="text-indigo-400 uppercase tracking-widest font-bold">Privacy Note:</span> Data is processed securely in memory and never shared.
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 2: MAPPING */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white">Map Your Columns</h3>
                            <p className="text-slate-400 text-sm">Match your uploaded columns to Recoup's required format.</p>
                        </div>
                        
                        <div className="bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-800/50 text-slate-400 uppercase tracking-wider text-xs font-semibold">
                                    <tr>
                                        <th className="p-4 w-1/2">Recoup Field</th>
                                        <th className="p-4 w-1/2">Your Column</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {REQUIRED_FIELDS.map(f => (
                                        <tr key={f.key}>
                                            <td className="p-4">
                                                <div className="font-medium text-slate-200">{f.label}</div>
                                                {(f.key === 'record_id' || f.key === 'amount') && <span className="text-[10px] uppercase font-bold tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded ml-2">Required</span>}
                                            </td>
                                            <td className="p-4">
                                                <select 
                                                    value={mapping[f.key] || ""}
                                                    onChange={e => setMapping({...mapping, [f.key]: e.target.value})}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">-- Ignore / Not Available --</option>
                                                    {parsedData.columns.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setStep(1)} className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Back</button>
                            <button 
                                onClick={handleValidate} 
                                disabled={validating}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                            >
                                {validating ? "Validating..." : "Validate Data"} <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: VALIDATION */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                                <CheckCircle size={32} className="text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Validation Complete</h3>
                            <p className="text-slate-400">Your data is ready for the Recoup Engine.</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-1">Valid Records</p>
                                <p className="text-3xl font-black text-emerald-100">{validationResult.valid_count}</p>
                            </div>
                            <div className="p-5 bg-slate-800/50 border border-white/5 rounded-xl flex flex-col justify-between max-h-[250px] overflow-auto custom-scrollbar">
                                <div>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Ignored (Invalid)</p>
                                    <p className="text-3xl font-black text-slate-200">{validationResult.invalid_count}</p>
                                </div>
                                {validationResult.invalid_count > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-xs font-semibold text-red-400 mb-2 uppercase">Reasons for rejection:</p>
                                        <ul className="text-xs text-slate-400 space-y-1">
                                            {Array.from(validationResult.invalid_records.reduce((acc, curr) => {
                                                acc.set(curr.reason, (acc.get(curr.reason) || 0) + 1);
                                                return acc;
                                            }, new Map())).map(([reason, count], idx) => (
                                                <li key={idx} className="flex justify-between">
                                                    <span>{reason}</span>
                                                    <span className="font-mono bg-slate-900 px-1 rounded">{count}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-white/5">
                            <button onClick={() => setStep(2)} className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">Re-map Columns</button>
                            <button 
                                onClick={() => onComplete(validationResult.valid_records)} 
                                disabled={validationResult.valid_count === 0}
                                className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                Run Engine <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
