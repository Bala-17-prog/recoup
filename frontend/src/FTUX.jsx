import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, PlayCircle, BookOpen, HelpCircle, Activity, ShieldCheck, Database, Zap, FileCheck, ShieldAlert, ArrowRight, Target, RefreshCw } from 'lucide-react';

const useScrollLock = () => {
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);
};

export const OnboardingModal = ({ onDismiss, onStartTour, onRunDemo }) => {
    useScrollLock();
    return createPortal(
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center relative">
                <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4 ring-1 ring-white/20 shadow-lg">
                    <Activity size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Recoup 👋</h2>
                <p className="text-blue-100 font-medium">AI Revenue Recovery Agent</p>
            </div>
            
            <div className="p-8">
                <p className="text-slate-300 text-center mb-8 text-sm leading-relaxed">
                    Recoup detects revenue at risk, diagnoses the root cause, chooses the best recovery intervention, applies policy guardrails, and tracks the outcome.
                </p>
                
                <div className="flex flex-col gap-3">
                    <button onClick={onStartTour} className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2">
                        <PlayCircle size={18} /> Run a 60-sec Tour
                    </button>
                    <button onClick={onRunDemo} className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2">
                        <Database size={18} /> Try Demo Data
                    </button>
                    <button onClick={onDismiss} className="w-full py-3 px-4 text-slate-400 hover:text-slate-200 font-bold rounded-xl transition-colors text-sm uppercase tracking-wider">
                        Explore Myself
                    </button>
                </div>
            </div>
        </div>
    </div>,
    document.body
    );
};

export const HowItWorksModal = ({ onClose }) => {
    useScrollLock();
    
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return createPortal(
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-32px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><BookOpen className="text-blue-400"/> How Recoup Works</h2>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"><X size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                <div className="flex flex-col gap-2 relative">
                    <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 opacity-50 z-0"></div>
                    
                    {[
                        { icon: Database, color: 'text-slate-400', title: 'Input Data', desc: 'Ingests raw payment, invoice, and subscription datasets.' },
                        { icon: Activity, color: 'text-red-400', title: 'Detect Revenue at Risk', desc: 'Identifies failed transactions, missed promises, and drop-offs.' },
                        { icon: Target, color: 'text-amber-400', title: 'Diagnose Root Cause', desc: 'Determines why the failure occurred (e.g. insufficient funds, pricing friction).' },
                        { icon: Zap, color: 'text-blue-400', title: 'Generate Candidate Actions', desc: 'Formulates potential recovery interventions (e.g. email, voice, retry).' },
                        { icon: Activity, color: 'text-indigo-400', title: 'Calculate Expected Value', desc: 'Estimates the net recovery impact of an intervention using probability, effectiveness, and cost.' },
                        { icon: ShieldAlert, color: 'text-orange-400', title: 'Apply Policy Guardrails', desc: 'Blocks actions that violate retry limits, cost thresholds, or compliance rules.' },
                        { icon: FileCheck, color: 'text-emerald-400', title: 'Select Best Permitted Action', desc: 'Chooses the intervention with the highest Expected Value that passes all policies.' },
                        { icon: ArrowRight, color: 'text-purple-400', title: 'Execute / Escalate', desc: 'Simulates the recovery action or escalates to human review.' },
                        { icon: ShieldCheck, color: 'text-teal-400', title: 'Audit & Measure Recovery', desc: 'Logs the full decision trace and calculates the batch financial impact.' },
                    ].map((step, i) => (
                        <div key={i} className="flex gap-4 relative z-10 p-3 bg-slate-900 rounded-xl hover:bg-slate-800/50 transition-colors">
                            <div className={`w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 shadow-md ${step.color}`}>
                                <step.icon size={18} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-200">{step.title}</h3>
                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>,
    document.body
    );
};

export const ProductTourOverlay = ({ step, onNext, onEnd, onRunDemo }) => {
    const steps = [
        {
            title: "1. Choose your data",
            text: "Use Demo Data to explore Recoup instantly, or upload your own company CSV.",
            btn: "Next"
        },
        {
            title: "2. Run the Recovery Engine",
            text: "Recoup analyzes each record, diagnoses the revenue risk, evaluates recovery strategies, applies policy guardrails, and selects the best permitted action.",
            btn: "Next"
        },
        {
            title: "3. Understand the recovery impact",
            text: "Review revenue at risk, expected recovery, recovered revenue, and AI lift.",
            btn: "Next"
        },
        {
            title: "4. Inspect every decision",
            text: "Every recovery decision is recorded with its root cause, candidate action, policy result, execution, and outcome.",
            btn: "Next"
        },
        {
            title: "5. Understand WHY",
            text: "Open Decision Details to inspect confidence, Expected Value, retry sequence, policy decisions, execution trace, and the generated recovery message.",
            btn: "Next"
        },
        {
            title: "6. Track promised payments",
            text: "Records containing a valid Promise Date automatically appear in the Promise-to-Pay tracker.",
            btn: "Next"
        },
        {
            title: "You're ready 🚀",
            text: "Run Demo Data to see the complete recovery workflow, or upload your own CSV.",
            btn: "Run Demo"
        }
    ];

    const current = steps[step];
    if (!current) return null;

    useScrollLock();

    return createPortal(
        <div className="fixed z-[100] bottom-4 left-4 right-4 w-[calc(100vw-32px)] sm:w-[380px] sm:left-auto sm:right-8 sm:bottom-8 max-h-[calc(100vh-32px)] overflow-y-auto bg-slate-800 border border-blue-500/50 rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 ring-4 ring-blue-500/20">
            <h3 className="text-lg font-bold text-white mb-2">{current.title}</h3>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">{current.text}</p>
            <div className="flex items-center justify-between">
                <button onClick={onEnd} className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider">Finish Tour</button>
                <button 
                    onClick={step === steps.length - 1 ? onRunDemo : onNext}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-md transition-colors text-sm"
                >
                    {current.btn}
                </button>
            </div>
            
            {/* Progress dots */}
            <div className="flex gap-1.5 mt-6 justify-center">
                {steps.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-4 bg-blue-500' : 'w-1.5 bg-slate-700'}`} />
                ))}
            </div>
        </div>,
        document.body
    );
};

export const DemoScenarios = () => (
    <div className="bg-slate-900 border border-indigo-500/20 rounded-2xl p-6 mb-6 mt-6">
        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <BookOpen size={16} /> Recovery Scenarios
        </h3>
        <p className="text-xs text-slate-400 mb-4">Run a simulation to explore how Recoup detects risk, chooses an intervention, and recovers revenue.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
                { name: "Payment Failure", desc: "Diagnosis & recovery" },
                { name: "Checkout Drop-off", desc: "Abandonment recovery" },
                { name: "Subscription Failure", desc: "Card update recovery" },
                { name: "B2B Receivable", desc: "Chasing & Hinglish" },
                { name: "Mandate Retry 0", desc: "Immediate path" },
                { name: "Mandate Retry 1", desc: "Scheduled path" },
                { name: "Mandate Retry 3", desc: "Policy escalation" },
                { name: "Promise-to-Pay", desc: "Promise tracking" }
            ].map((s, i) => (
                <div key={i} className="bg-slate-950 p-3 rounded-lg border border-white/5 flex flex-col justify-center text-center hover:border-indigo-500/30 transition-colors">
                    <p className="text-xs font-bold text-slate-200">{s.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{s.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

export const HelpDropdown = ({ onTour, onHowItWorks, onDemo, onUpload }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700">
                <HelpCircle size={18} />
            </button>
            {open && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden text-sm">
                    <button onClick={() => { setOpen(false); onUpload(); }} className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white">Upload Company Data</button>
                    <button onClick={() => { setOpen(false); onHowItWorks(); }} className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white border-t border-slate-700">How Recoup Works</button>
                    <button onClick={() => { setOpen(false); onTour(); }} className="w-full text-left px-4 py-2.5 text-slate-300 hover:bg-slate-700 hover:text-white border-t border-slate-700">Replay Product Tour</button>
                </div>
            )}
        </div>
    );
};
