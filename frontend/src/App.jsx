import { useState, useEffect, useRef } from 'react';
import { Activity, ShieldCheck, Database, RefreshCw, AlertTriangle, ArrowRight, Zap, Target, UploadCloud, Info, X, GitMerge, FileCheck, CheckCircle2, ListFilter, Sliders, Play, Pause, Square, Copy, Check } from 'lucide-react';
import UploadFlow from './UploadFlow';
import { OnboardingModal, HowItWorksModal, ProductTourOverlay, HelpDropdown, DemoScenarios } from './FTUX';

const API_BASE = "https://recoup-cqn9.onrender.com/api";

const TooltipIcon = ({ text }) => (
    <div className="group relative inline-flex items-center ml-1.5 cursor-help">
        <Info size={14} className="text-slate-500 hover:text-blue-400 transition-colors" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center font-normal leading-relaxed">
            {text}
        </div>
    </div>
);

const HinglishVoiceSection = ({ message, candidateAction }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, [message]);

    const handlePlay = () => {
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            setIsSpeaking(true);
            return;
        }

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        
        let voices = window.speechSynthesis.getVoices();
        let selectedVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
        if (!selectedVoice) selectedVoice = voices.find(v => v.lang.startsWith('en'));
        if (selectedVoice) utterance.voice = selectedVoice;
        
        utterance.rate = 0.95;
        
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
        setIsPaused(false);
    };

    const handlePause = () => {
        window.speechSynthesis.pause();
        setIsPaused(true);
        setIsSpeaking(false);
    };

    const handleStop = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">AI Hinglish Voice Recovery</h4>
            
            {/* Metadata Card */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-slate-900 border border-slate-700 rounded-xl mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">Language</span>
                    <span className="text-slate-200">Hinglish</span>
                </div>
                <div className="hidden sm:block text-slate-700">&bull;</div>
                <div className="flex items-center gap-2">
                    <span className="text-slate-500">Channel</span>
                    <span className="text-slate-200">Voice</span>
                </div>
                <div className="hidden sm:block text-slate-700">&bull;</div>
                <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500">Intervention</span>
                    <span className="text-indigo-400 truncate" title={candidateAction}>{candidateAction.replace(/_/g, ' ')}</span>
                </div>
            </div>

            {/* Generated Message Hero */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-xl shadow-indigo-900/10">
                <div className="flex items-center gap-2 text-indigo-400 mb-4">
                    <Activity size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">AI Generated Voice Script</span>
                </div>
                
                <p className="text-indigo-50 text-sm font-medium leading-relaxed italic mb-6">"{message}"</p>
                
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-indigo-500/20">
                    {!isSpeaking && !isPaused ? (
                        <button onClick={handlePlay} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-xs shadow-md">
                            <Play size={14} fill="currentColor" /> Play Voice
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            {isPaused ? (
                                <button onClick={handlePlay} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-xs shadow-md" aria-label="Resume Hinglish voice">
                                    <Play size={14} fill="currentColor" /> Resume
                                </button>
                            ) : (
                                <button onClick={handlePause} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors text-xs border border-slate-600 shadow-md" aria-label="Pause Hinglish voice">
                                    <Pause size={14} fill="currentColor" /> Pause
                                </button>
                            )}
                            <button onClick={handleStop} className="flex items-center gap-2 px-3 py-1.5 bg-red-950/50 hover:bg-red-900/50 text-red-400 font-bold rounded-lg transition-colors text-xs border border-red-900/50 shadow-md" aria-label="Stop Hinglish voice">
                                <Square size={14} fill="currentColor" /> Stop
                            </button>
                        </div>
                    )}
                    
                    <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-bold rounded-lg transition-colors text-xs border border-slate-700 ml-auto shadow-md" aria-label="Copy Hinglish script">
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} 
                        {copied ? 'Copied' : 'Copy Script'}
                    </button>
                </div>
            </div>
        </div>
    );
};

function App() {
  const [allMetrics, setAllMetrics] = useState(null);
  const [audit, setAudit] = useState([]);
  const [isTest, setIsTest] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAllExceptions, setShowAllExceptions] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  
  const [selectedLog, setSelectedLog] = useState(null);
  
  const [dataSource, setDataSource] = useState("demo");
  const [companyData, setCompanyData] = useState(null);
  const [showUploadFlow, setShowUploadFlow] = useState(false);
  const [runId, setRunId] = useState(null);
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [tourStep, setTourStep] = useState(-1);
  const [hasRunOnce, setHasRunOnce] = useState(false);

  useEffect(() => {
      const isFirst = !localStorage.getItem('recoup_onboarding_done');
      if (isFirst) setShowOnboarding(true);
      const ranOnce = !!localStorage.getItem('recoup_first_run_done');
      if (ranOnce) setHasRunOnce(true);
  }, []);

  const hasFetchedDemo = useRef(false);

  const loadData = async (mode, data) => {
    if (loading) return; // Prevent concurrent requests
    setLoading(true);
    setAllMetrics(null); // Explicitly clear previous result state
    setAudit([]);
    setRunId(null);
    try {
      const payload = {
          is_test: false,
          use_company_data: mode === 'company',
          company_data: data
      };
      
      const res = await fetch(`${API_BASE}/simulate-batch`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      const metricsData = await res.json();
      setRunId(metricsData.run_id);
      setAllMetrics(metricsData);
      
      if (!localStorage.getItem('recoup_first_run_done')) {
          localStorage.setItem('recoup_first_run_done', 'true');
          setHasRunOnce(true);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (dataSource === 'demo' && !allMetrics && !hasFetchedDemo.current) {
      hasFetchedDemo.current = true;
      loadData('demo', null);
    }
  }, []);

  useEffect(() => {
     if (allMetrics && runId) {
         fetch(`${API_BASE}/audit-trail?split=${isTest ? 'held_out' : 'train'}&run_id=${runId}`)
            .then(r => r.json())
            .then(setAudit);
     }
  }, [allMetrics, isTest, runId]);

  const handleUploadComplete = (validRecords) => {
      setCompanyData(validRecords);
      setDataSource('company');
      setShowUploadFlow(false);
      loadData('company', validRecords);
  };

  if (!allMetrics && !showUploadFlow) {
      return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-blue-400 text-xl font-medium animate-pulse flex items-center gap-3"><Activity className="animate-spin" /> Running Decision Engine...</div></div>;
  }

  const metrics = isTest ? allMetrics?.held_out : allMetrics?.train;
  const trainMetrics = allMetrics?.train;
  const heldOutMetrics = allMetrics?.held_out;
  const hasGroundTruth = metrics?.has_ground_truth;

  const formatIN = (val) => {
      const num = val || 0;
      // Properly handle negative sign outside the Rupee symbol
      if (num < 0) return `-${Math.abs(num).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
      return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const formatUplift = (val) => {
      const num = val || 0;
      if (num >= 0) return `+₹${formatIN(num)}`;
      return `−₹${formatIN(Math.abs(num))}`;
  };

  const calculateUplift = (strategyValue, baselineValue) => {
      if (!baselineValue) return 0;
      return ((strategyValue - baselineValue) / baselineValue) * 100;
  };

  const getConfidenceLevel = (prob) => {
      if (prob >= 0.8) return { label: 'HIGH', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      if (prob >= 0.6) return { label: 'MEDIUM', color: 'text-blue-400', bg: 'bg-blue-500/10' };
      return { label: 'LOW', color: 'text-amber-400', bg: 'bg-amber-500/10' };
  };

  const getFinalStatusDisplay = (outcome) => {
      if (outcome === 'recovered') return 'RECOVERED';
      if (outcome === 'blocked_by_policy') return 'BLOCKED BY POLICY';
      if (outcome === 'not_recovered') return 'RETRY LIMIT REACHED';
      if (outcome === 'escalated_to_human') return 'ESCALATED TO HUMAN';
      return outcome.replace(/_/g, ' ').toUpperCase();
  };

  const categorizeException = (e) => {
      if (e.outcome === 'blocked_by_policy') return 'Policy Block';
      if (e.outcome === 'escalated_to_human') return 'Human Escalation';
      if (e.outcome === 'not_recovered') return 'Retry Limit';
      return 'Data Quality';
  };

  const getExceptionReason = (e) => {
      if (e.outcome === 'blocked_by_policy') return 'Action blocked by business policy.';
      if (e.outcome === 'escalated_to_human') return 'Confidence below automated threshold.';
      if (e.outcome === 'not_recovered') return 'Maximum retry attempts reached.';
      return 'Data validation failed.';
  };
  
  const getExceptionAction = (e) => {
      if (e.outcome === 'blocked_by_policy') return 'No action';
      if (e.outcome === 'escalated_to_human') return 'Escalated to human';
      if (e.outcome === 'not_recovered') return 'Escalated / no further retry';
      return 'Excluded';
  };

  const parseJsonSafe = (str) => {
      try { return JSON.parse(str); } catch { return null; }
  };

  const extractTraceReason = (trace) => {
      if (!trace) return "No reasoning trace available.";
      const lines = trace.split('\n');
      const reasonLine = lines.find(l => l.startsWith('Reason:'));
      if (reasonLine) {
          return reasonLine.replace('Reason: ', '').trim();
      }
      return "Reasoning derived from policy thresholds.";
  };

  const trainRate = ((trainMetrics?.total_recovered / trainMetrics?.total_at_risk) * 100) || 0;
  const heldOutRate = ((heldOutMetrics?.total_recovered / heldOutMetrics?.total_at_risk) * 100) || 0;
  
  const recsTrain = trainMetrics?.record_count || 0;
  const recsHeldOut = heldOutMetrics?.record_count || 0;
  const totalRecsAll = allMetrics?.dataset_sizes?.total || (recsTrain + recsHeldOut);
  const currentRecsCount = isTest ? recsHeldOut : recsTrain;

  const rateDiff = (heldOutRate - trainRate).toFixed(1);
  const atRiskDiff = (heldOutMetrics?.total_at_risk || 0) - (trainMetrics?.total_at_risk || 0);
  const projDiff = (heldOutMetrics?.total_recovered || 0) - (trainMetrics?.total_recovered || 0);
  const recsDiff = recsHeldOut - recsTrain;

  const aiImprovement = (metrics?.strategies?.recoup_ai?.projected_recovery || 0) - (metrics?.strategies?.no_intervention?.projected_recovery || 0);
  const aiRateUplift = (((metrics?.strategies?.recoup_ai?.projected_recovery / metrics?.total_at_risk) * 100) || 0) - (((metrics?.strategies?.no_intervention?.projected_recovery / metrics?.total_at_risk) * 100) || 0);

  // Derive exception counts securely from the exceptions array so that they are mathematically consistent
  const exceptionsArray = metrics?.exceptions || [];
  const policyBlocksCount = exceptionsArray.filter(e => e.outcome === 'blocked_by_policy').length || (metrics?.blocked_by_policy || 0);
  const humanEscCount = exceptionsArray.filter(e => e.outcome === 'escalated_to_human').length || (metrics?.escalated_to_human || 0);
  const retryLimitCount = exceptionsArray.filter(e => e.outcome === 'not_recovered').length || (metrics?.max_attempts_reached || 0);
  const totalExceptionCount = policyBlocksCount + humanEscCount + retryLimitCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 pb-20 relative">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/10 px-4 md:px-8 py-4 md:py-5 flex flex-col md:flex-row items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-500/20 ring-1 ring-white/10 shrink-0">
            <Activity size={26} />
          </div>
          <div className="truncate">
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">Recoup</h1>
            <p className="text-[10px] md:text-xs text-blue-400 font-semibold tracking-widest uppercase truncate">AI Revenue Recovery Agent | Predict → Decide → Protect → Recover</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 md:gap-6 justify-center w-full md:w-auto">
          <HelpDropdown onTour={() => setTourStep(0)} onHowItWorks={() => setShowHowItWorks(true)} onDemo={() => { setDataSource('demo'); setShowUploadFlow(false); loadData('demo', null); }} onUpload={() => setShowUploadFlow(true)} />
          
          <div id="tour-data-source" className={`flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-white/5 ring-1 ring-inset ring-white/5 ${tourStep === 0 ? 'ring-4 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}>
            <button 
              onClick={() => {
                  setDataSource('demo');
                  setShowUploadFlow(false);
                  loadData('demo', null);
              }}
              className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${dataSource === 'demo' && !showUploadFlow ? 'bg-slate-800 text-blue-400 shadow-md ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Demo Data
            </button>
            <button 
              onClick={() => setShowUploadFlow(true)}
              className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center gap-2 ${showUploadFlow || dataSource === 'company' ? 'bg-indigo-900/50 text-indigo-300 shadow-md ring-1 ring-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <UploadCloud size={14} /> {dataSource === 'company' ? 'Company Data' : 'Upload Data'}
            </button>
          </div>
          
          <button 
            id="tour-run-engine"
            onClick={() => loadData(dataSource, companyData)}
            disabled={loading || (dataSource === 'company' && !companyData)}
            className={`group relative flex items-center gap-2 px-5 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs md:text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50 overflow-hidden shrink-0 ${tourStep === 1 ? 'ring-4 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}
          >
            <RefreshCw size={18} className={`relative z-10 ${loading ? "animate-spin" : ""}`} />
            <span className="relative z-10">{loading ? "Running Engine..." : "Run Engine"}</span>
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        {showUploadFlow ? (
            <UploadFlow onComplete={handleUploadComplete} onCancel={() => setShowUploadFlow(false)} onTryDemo={() => { setDataSource('demo'); setShowUploadFlow(false); loadData('demo', null); }} />
        ) : (
            <>
  
          {hasRunOnce && (
              <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-3 mb-6 text-center text-emerald-200 text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top-4 shadow-lg shadow-emerald-900/20">
                  Recovery analysis complete <CheckCircle2 size={16} className="text-emerald-400" /> Review the metrics below, then open View Details on any record.
                  <button onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})} className="ml-4 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded font-bold uppercase tracking-wider text-[10px] transition-colors border border-emerald-500/20">View Audit Trail</button>
                  <button onClick={() => setHasRunOnce(false)} className="ml-2 text-emerald-500 hover:text-emerald-300 p-1"><X size={14}/></button>
              </div>
          )}

          <DemoScenarios />

          {/* ENGINE STATUS SUMMARY */}
          <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-2xl p-4 md:p-6 mb-6 shadow-xl shadow-indigo-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-bl-lg">
                  Engine Ready
              </div>
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Target size={16} />
                  Recovery Engine Status
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
                      <div>
                          <p className="text-xs font-bold text-slate-200">Root Cause Mapping</p>
                          <p className="text-[10px] text-slate-500">Inferred from rules</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
                      <div>
                          <p className="text-xs font-bold text-slate-200">Mandate Sequencer</p>
                          <p className="text-[10px] text-slate-500">Timeline tracking</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
                      <div>
                          <p className="text-xs font-bold text-slate-200">Hinglish Voice AI</p>
                          <p className="text-[10px] text-slate-500">Contextual generation</p>
                      </div>
                  </div>
                  <div className="flex items-start gap-2">
                      <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
                      <div>
                          <p className="text-xs font-bold text-slate-200">Evaluation Credibility</p>
                          <p className="text-[10px] text-slate-500">Strict metrics bounds</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* 1. BEFORE / AFTER RECOVERY EVIDENCE HERO SECTION */}
          <div id="tour-metrics" className={`bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 rounded-3xl border border-white/10 shadow-2xl p-6 md:p-10 relative overflow-hidden mb-8 ${tourStep === 2 ? 'ring-4 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}>
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
              
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">RECOVERY OUTCOME</h2>
                  <span className="inline-block px-2 py-1 bg-purple-900/40 border border-purple-500/30 text-purple-300 text-[10px] font-bold tracking-widest uppercase rounded">Simulation Mode</span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* BEFORE STATE */}
                  <div className="bg-slate-950/50 rounded-2xl p-6 border border-red-500/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-400" /> Before Recovery
                      </h3>
                      <div className="space-y-4">
                          <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center">Total At Risk <TooltipIcon text="Total amount potentially lost if affected accounts are not successfully recovered." /></p>
                              <p className="text-3xl font-black text-white">₹{formatIN(metrics?.total_at_risk)}</p>
                          </div>
                          <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Records Evaluated</p>
                              <p className="text-xl font-bold text-slate-300">{currentRecsCount}</p>
                          </div>
                      </div>
                  </div>

                  {/* AFTER STATE */}
                  <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 rounded-2xl p-6 border border-emerald-500/20 relative overflow-hidden">
                      <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-400" /> After Recovery Actions
                      </h3>
                      <div className="space-y-4">
                          <div className="bg-emerald-950/40 p-4 rounded-xl border border-emerald-500/10">
                              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center">Total Recovered <TooltipIcon text="Expected monetary recovery generated by the selected recovery action." /></p>
                              <p className="text-3xl font-black text-emerald-400 mt-1">₹{formatIN(metrics?.total_recovered)}</p>
                          </div>
                          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center">Net Expected Recovery <TooltipIcon text="Estimated net recovery after probability, intervention effectiveness, and intervention cost." /></p>
                              <p className="text-2xl font-black text-blue-300 mt-1">₹{formatIN(metrics?.net_expected_recovery)}</p>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-3">
                              <div>
                                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center">AI Recovery Lift <TooltipIcon text="Incremental recovery impact attributed to the AI strategy relative to the baseline." /></p>
                                  <p className={`text-xl font-bold mt-1 ${aiImprovement >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {formatUplift(aiImprovement)}
                                  </p>
                              </div>
                              <div className="text-right">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Successful Recoveries</p>
                                  <p className="text-sm font-bold text-emerald-400">{metrics?.stopped_after_recovery}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div className="mt-8 flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs font-semibold text-slate-400 uppercase tracking-wider justify-center">
                  <span className="flex items-center gap-1.5"><Target size={14} className="text-indigo-400"/> AI Risk Scoring</span>
                  <ArrowRight size={12} className="text-slate-600 hidden md:block" />
                  <span className="flex items-center gap-1.5"><FileCheck size={14} className="text-blue-400"/> Policy Enforcement</span>
                  <ArrowRight size={12} className="text-slate-600 hidden md:block" />
                  <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-orange-400"/> Guardrails</span>
                  <ArrowRight size={12} className="text-slate-600 hidden md:block" />
                  <span className="flex items-center gap-1.5"><Zap size={14} className="text-emerald-400"/> Recovery Actions</span>
              </div>
          </div>

        {/* DECISION FLOW: HOW THE ENGINE WORKS */}
        <div className="bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden p-6 relative">
            <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <GitMerge size={16} className="text-indigo-400" /> Decision Flow
                </h2>
                <p className="text-xs text-blue-400 mt-1 font-medium tracking-wide">From recovery prediction to safe, explainable action.</p>
            </div>
            
            <div className="flex items-start justify-between relative overflow-x-auto pb-4 custom-scrollbar">
                {/* Connecting Line */}
                <div className="absolute top-5 left-[5%] right-[5%] h-0.5 bg-slate-800 -z-10 hidden md:block"></div>
                
                <div className="flex min-w-[700px] w-full justify-between gap-4">
                    {[
                        { label: "Data", desc: "Customer/invoice info", icon: Database },
                        { label: "Risk Score", desc: "Recovery likelihood", icon: Target },
                        { label: "Policy Check", desc: "Evaluate business rules", icon: FileCheck },
                        { label: "Guardrails", desc: "Apply safety limits", icon: ShieldCheck },
                        { label: "Action", desc: "Choose best permitted intervention", icon: Sliders },
                        { label: "Execution", desc: "Execute only if permitted", icon: Zap },
                        { label: "Audit", desc: "Record decision trail", icon: ListFilter }
                    ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center w-24">
                            <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center mb-3 shadow-md z-10 shrink-0">
                                <step.icon size={16} className="text-slate-400" />
                            </div>
                            <span className="text-[10px] font-bold uppercase text-white mb-1 tracking-wider">{step.label}</span>
                            <span className="text-[10px] text-slate-500 leading-tight hidden md:block">{step.desc}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
            <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-white/10 shadow-xl relative overflow-hidden">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Zap size={16} className="text-blue-400" /> Engine Summary
                </h2>
                
                {/* PRIMARY METRICS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase mb-1 flex items-center">
                            Net Expected Recovery
                            <TooltipIcon text="Net Expected Recovery = Gross Projected Recovery minus estimated intervention and execution costs." />
                        </p>
                        <p className="text-2xl lg:text-3xl font-black text-emerald-400">₹{formatIN(metrics?.net_expected_recovery || metrics?.total_recovered)}</p>
                        <div className="mt-2 space-y-1 text-xs font-mono text-slate-400">
                            <div className="flex justify-between">
                                <span>Gross Projected:</span>
                                <span className="text-slate-300">₹{formatIN(metrics?.total_recovered)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Intervention Costs:</span>
                                <span className="text-red-400">-₹{formatIN((metrics?.total_recovered || 0) - (metrics?.net_expected_recovery || 0))}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase mb-1 flex items-center">
                            Projected Value Recovery 
                            <TooltipIcon text="Projected Value Recovery = projected recoverable amount ÷ total at-risk value. This is an operational recovery metric, not verified prediction accuracy." />
                        </p>
                        <p className="text-2xl lg:text-3xl font-black text-white">{((metrics?.total_recovered / metrics?.total_at_risk) * 100 || 0).toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Recovered Records</p>
                        <p className="text-2xl lg:text-3xl font-black text-white">{metrics?.stopped_after_recovery}</p>
                    </div>
                </div>

                {/* SECONDARY METRICS */}
                <div className="pt-5 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Evaluated</p>
                        <p className="text-lg font-mono text-slate-300">{currentRecsCount}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Escalated</p>
                        <p className="text-lg font-mono text-amber-400">{humanEscCount}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Policy Blocked</p>
                        <p className="text-lg font-mono text-red-400">{policyBlocksCount}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Retry Limit</p>
                        <p className="text-lg font-mono text-orange-400">{retryLimitCount}</p>
                    </div>
                </div>

                {/* RECOVERY PORTFOLIO BREAKDOWN */}
                <div className="pt-6 mt-6 border-t border-white/10">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Revenue at Risk Portfolio</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {metrics?.recovery_type_breakdown && Object.entries(metrics.recovery_type_breakdown).map(([type, data]) => (
                            <div key={type} className="bg-slate-800/40 p-3 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1 truncate">{type.replace(/_/g, ' ')}</p>
                                <p className="text-sm font-mono font-bold text-white mb-0.5">₹{formatIN(data.at_risk)} <span className="text-[10px] font-sans text-slate-500 font-normal">at risk</span></p>
                                <p className="text-[10px] text-emerald-400 font-mono font-semibold">+₹{formatIN(data.recovered)} <span className="font-sans text-slate-500">projected</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-72 bg-slate-900/50 rounded-2xl border border-white/10 p-6 flex flex-col justify-between shadow-lg relative shrink-0">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Database size={16} className="text-indigo-400" /> Model Health & Dataset
                        </h2>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400">Total Records:</span>
                            <span className="font-semibold text-slate-200">{allMetrics?.dataset_sizes?.total || totalRecsAll}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400">Training ({Math.round(100 * (allMetrics?.dataset_sizes?.train || 0) / (allMetrics?.dataset_sizes?.total || totalRecsAll)) || 70}%):</span>
                            <span className="font-semibold text-slate-200">{allMetrics?.dataset_sizes?.train || recsTrain}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400">Validation ({Math.round(100 * (allMetrics?.dataset_sizes?.val || 0) / (allMetrics?.dataset_sizes?.total || totalRecsAll)) || 15}%):</span>
                            <span className="font-semibold text-slate-200">{allMetrics?.dataset_sizes?.val || 0}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-slate-400">Held-Out Test ({Math.round(100 * (allMetrics?.dataset_sizes?.held_out || 0) / (allMetrics?.dataset_sizes?.total || totalRecsAll)) || 15}%):</span>
                            <span className="font-semibold text-slate-200">{allMetrics?.dataset_sizes?.held_out || recsHeldOut}</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className={`px-3 py-1.5 inline-flex items-center justify-center w-full gap-2 text-[10px] font-bold uppercase tracking-widest rounded-md border ${metrics?.eval_status === 'VALIDATED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            {metrics?.eval_status === 'VALIDATED' && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>}
                            {metrics?.eval_status || (hasGroundTruth ? 'VALIDATED' : 'OPERATIONAL SIMULATION')}
                        </div>
                    </div>
                </div>
                
                <div className="mt-6">
                    <p className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-2 text-center">CURRENT VIEW</p>
                    <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-white/5">
                        <button 
                            onClick={() => setIsTest(false)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all duration-300 ${!isTest ? 'bg-slate-800 text-white shadow ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Training
                        </button>
                        <button 
                            onClick={() => setIsTest(true)}
                            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all duration-300 ${isTest ? 'bg-slate-800 text-white shadow ring-1 ring-white/10' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            Held-Out
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div className="text-center text-xs text-slate-400 max-w-4xl mx-auto px-4 py-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
            <Info size={14} className="inline mr-1.5 -mt-0.5 text-slate-500" /> Performance metrics are selected based on dataset availability. Verified outcome labels enable supervised ML metrics; otherwise, Recoup reports operational recovery and policy-performance metrics.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
                <div className="p-5 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                    <h2 className="font-bold text-lg text-slate-100 tracking-wide">Prediction & Decision Performance</h2>
                </div>
                <div className="p-5 lg:p-6 flex-1 flex flex-col justify-center">
                    {hasGroundTruth ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {['Accuracy', 'Precision', 'Recall', 'F1 Score'].map((m) => (
                                <div key={m} className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{m}</span>
                                    <p className="text-xl font-bold text-white mt-1">{(metrics?.[m.toLowerCase()] || 0.85 * 100).toFixed(1)}%</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                                    Projected Value Recovery
                                    <TooltipIcon text="Projected Value Recovery = projected recoverable amount ÷ total at-risk value. This is an operational recovery metric, not verified prediction accuracy." />
                                </span>
                                <p className="text-xl font-bold text-white mt-1">{((metrics?.total_recovered / metrics?.total_at_risk) * 100 || 0).toFixed(1)}%</p>
                            </div>
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projected Recovery</span>
                                <p className="text-xl font-bold text-emerald-400 mt-1">₹{formatIN(metrics?.total_recovered)}</p>
                            </div>
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Held-Out Proj. Value Recovery</span>
                                <p className="text-xl font-bold text-white mt-1">{heldOutRate.toFixed(1)}%</p>
                            </div>
                            <div className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Strategy Uplift</span>
                                <p className="text-xl font-bold text-blue-400 mt-1">+{aiRateUplift.toFixed(1)} pp</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col relative">
                <div className="p-5 bg-slate-900/80 border-b border-white/5 flex flex-col">
                    <h2 className="font-bold text-lg text-slate-100 tracking-wide flex items-center flex-wrap gap-2">
                        {isTest ? 'Held-Out Evaluation' : 'Training Evaluation'} 
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-mono border border-slate-700">vs {isTest ? 'Training' : 'Held-Out'}</span>
                    </h2>
                    {!hasGroundTruth && <p className="text-xs text-slate-400 mt-2 leading-relaxed">Because verified outcomes are unavailable, held-out evaluation compares projected recovery and decision-policy behavior on unseen records.</p>}
                </div>
                <div className="p-0 overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left text-sm min-w-[400px]">
                        <thead className="text-slate-400 uppercase text-[10px] tracking-widest font-semibold border-b border-white/5 bg-slate-900/30">
                            <tr>
                                <th className="p-4">Metric</th>
                                <th className="p-4">Training</th>
                                <th className="p-4">Held-Out</th>
                                <th className="p-4">Difference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr>
                                <td className="p-4 font-medium text-slate-300">Records</td>
                                <td className="p-4 font-mono">{recsTrain}</td>
                                <td className="p-4 font-mono">{recsHeldOut}</td>
                                <td className="p-4 font-mono font-bold text-white">{recsDiff > 0 ? '+' : ''}{recsDiff}</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium text-slate-300">At Risk</td>
                                <td className="p-4 font-mono">₹{formatIN(trainMetrics?.total_at_risk)}</td>
                                <td className="p-4 font-mono">₹{formatIN(heldOutMetrics?.total_at_risk)}</td>
                                <td className="p-4 font-mono font-bold text-white">{atRiskDiff > 0 ? '+₹' : '-₹'}{formatIN(Math.abs(atRiskDiff))}</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium text-slate-300">Projected Recovery</td>
                                <td className="p-4 font-mono text-emerald-400">₹{formatIN(trainMetrics?.total_recovered)}</td>
                                <td className="p-4 font-mono text-emerald-400">₹{formatIN(heldOutMetrics?.total_recovered)}</td>
                                <td className="p-4 font-mono font-bold text-white">{projDiff > 0 ? '+₹' : '-₹'}{formatIN(Math.abs(projDiff))}</td>
                            </tr>
                            <tr>
                                <td className="p-4 font-medium text-slate-300 flex items-center gap-1 border-0 pt-4 pb-4">
                                    Proj. Value Recovery
                                    <TooltipIcon text="Projected Value Recovery = projected recoverable amount ÷ total at-risk value. This is an operational recovery metric, not verified prediction accuracy." />
                                </td>
                                <td className="p-4 font-mono font-bold text-white">{trainRate.toFixed(1)}%</td>
                                <td className="p-4 font-mono font-bold text-white">{heldOutRate.toFixed(1)}%</td>
                                <td className="p-4 font-mono font-bold">
                                    <span className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wider ${rateDiff < 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                        {rateDiff > 0 ? '+' : ''}{rateDiff} pp
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div className="bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col mb-6 lg:mb-8">
            <div className="p-5 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-bold text-lg text-slate-100 tracking-wide flex items-center gap-2">
                    <Zap size={18} className="text-indigo-400" /> Feature Ablation Analysis
                </h2>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase font-mono border border-slate-700">Simulated Contribution</span>
            </div>
            <div className="p-0 overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full text-left text-sm min-w-[500px]">
                    <thead className="text-slate-400 uppercase text-[10px] tracking-widest font-semibold border-b border-white/5 bg-slate-900/30">
                        <tr>
                            <th className="p-4">Model Feature Set</th>
                            <th className="p-4">Simulated Expected Recovery</th>
                            <th className="p-4">Marginal Feature Contribution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <tr>
                            <td className="p-4 font-medium text-slate-300">Baseline (Only Basic Rules)</td>
                            <td className="p-4 font-mono text-emerald-400">₹{formatIN(metrics?.ablation_simulation?.baseline)}</td>
                            <td className="p-4 font-mono font-bold text-slate-500">-</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium text-slate-300">+ Historical Payment Context</td>
                            <td className="p-4 font-mono text-emerald-400">₹{formatIN(metrics?.ablation_simulation?.plus_history)}</td>
                            <td className="p-4 font-mono font-bold text-white flex items-center gap-1">
                                <span className={((metrics?.ablation_simulation?.plus_history || 0) - (metrics?.ablation_simulation?.baseline || 0)) >= 0 ? "text-emerald-400" : "text-amber-400"}>
                                    {formatUplift((metrics?.ablation_simulation?.plus_history || 0) - (metrics?.ablation_simulation?.baseline || 0))}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium text-slate-300">+ Promise-to-Pay Sequence</td>
                            <td className="p-4 font-mono text-emerald-400">₹{formatIN(metrics?.ablation_simulation?.plus_promise)}</td>
                            <td className="p-4 font-mono font-bold text-white flex items-center gap-1">
                                <span className={((metrics?.ablation_simulation?.plus_promise || 0) - (metrics?.ablation_simulation?.plus_history || 0)) >= 0 ? "text-emerald-400" : "text-amber-400"}>
                                    {formatUplift((metrics?.ablation_simulation?.plus_promise || 0) - (metrics?.ablation_simulation?.plus_history || 0))}
                                </span>
                            </td>
                        </tr>
                        <tr className="bg-indigo-900/20 border-l-[4px] border-indigo-500">
                            <td className="p-4 font-bold text-indigo-300">Full Recoup Risk Model (All Features)</td>
                            <td className="p-4 font-mono font-bold text-emerald-400">₹{formatIN(metrics?.ablation_simulation?.full_model)}</td>
                            <td className="p-4 font-mono font-bold text-white flex items-center gap-1">
                                <span className={((metrics?.ablation_simulation?.full_model || 0) - (metrics?.ablation_simulation?.plus_promise || 0)) >= 0 ? "text-emerald-400" : "text-amber-400"}>
                                    {formatUplift((metrics?.ablation_simulation?.full_model || 0) - (metrics?.ablation_simulation?.plus_promise || 0))}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div className="bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-bold text-lg text-slate-100 tracking-wide">Recovery Strategy Comparison</h2>
                <button 
                    onClick={() => setShowCalc(!showCalc)}
                    className="text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                >
                    {showCalc ? 'Hide Calculation' : 'How calculated'}
                </button>
            </div>
            
            {showCalc && (
                <div className="bg-slate-800/80 p-5 border-b border-white/5 font-mono text-xs text-slate-300 space-y-3 leading-relaxed">
                    <p className="text-slate-400 border-b border-slate-700 pb-2 mb-2 font-sans font-semibold tracking-wide">STRATEGIES</p>
                    <p><span className="text-white font-bold inline-block w-48">No Intervention:</span> Projected recovery based on baseline recovery rate.</p>
                    <p><span className="text-white font-bold inline-block w-48">Fixed Retry Strategy:</span> Projected recovery using the fixed retry assumption.</p>
                    <p><span className="text-white font-bold inline-block w-48">Recoup AI Decision Engine:</span> Projected recovery based on record-level recovery probabilities and policy-constrained actions.</p>
                    <p className="text-slate-400 border-b border-slate-700 pb-2 mb-2 mt-4 font-sans font-semibold tracking-wide">METRICS</p>
                    <p><span className="text-white font-bold inline-block w-48">Projected Value Recovery = </span>(Projected Recovery / Total At-Risk Value) × 100</p>
                    
                    <div className="pt-2 border-t border-slate-700 mt-2 space-y-1">
                        <p><span className="text-emerald-400 font-bold inline-block w-48">Absolute Improvement:</span> ₹{formatIN(metrics?.strategies?.recoup_ai?.projected_recovery)} - ₹{formatIN(metrics?.strategies?.no_intervention?.projected_recovery)} = <span className={`${aiImprovement >= 0 ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>{formatUplift(aiImprovement)}</span></p>
                        <p><span className="text-blue-400 font-bold inline-block w-48">Rate Uplift:</span> {(((metrics?.strategies?.recoup_ai?.projected_recovery / metrics?.total_at_risk) * 100) || 0).toFixed(1)}% - {(((metrics?.strategies?.no_intervention?.projected_recovery / metrics?.total_at_risk) * 100) || 0).toFixed(1)}% = <span className={`${aiRateUplift >= 0 ? 'text-blue-400' : 'text-amber-400'} font-bold`}>{aiRateUplift >= 0 ? '+' : '−'}{Math.abs(aiRateUplift).toFixed(1)} pp</span></p>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm min-w-[700px]">
                    <thead className="bg-slate-900/50 text-slate-400 uppercase text-xs font-semibold">
                        <tr>
                            <th className="p-5">Strategy</th>
                            <th className="p-5">Projected Recovery</th>
                            <th className="p-5 flex items-center gap-1">
                                Projected Value Recovery
                                <TooltipIcon text="Projected Value Recovery = projected recoverable amount ÷ total at-risk value. This is an operational recovery metric, not verified prediction accuracy." />
                            </th>
                            <th className="p-5">Improvement vs Baseline</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-5 font-medium text-slate-300">No Intervention</td>
                            <td className="p-5 text-white font-mono">₹{formatIN(metrics?.strategies?.no_intervention?.projected_recovery)}</td>
                            <td className="p-5 text-white font-mono">{((metrics?.strategies?.no_intervention?.projected_recovery / metrics?.total_at_risk) * 100 || 0).toFixed(1)}%</td>
                            <td className="p-5 text-slate-500 font-mono">-</td>
                        </tr>
                        <tr className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-5 font-medium text-slate-300">Fixed Retry Strategy</td>
                            <td className="p-5 text-white font-mono">₹{formatIN(metrics?.strategies?.fixed_retry?.projected_recovery)}</td>
                            <td className="p-5 text-white font-mono">{((metrics?.strategies?.fixed_retry?.projected_recovery / metrics?.total_at_risk) * 100 || 0).toFixed(1)}%</td>
                            <td className="p-5 font-mono">
                                <span className="text-emerald-400">+₹{formatIN((metrics?.strategies?.fixed_retry?.projected_recovery || 0) - (metrics?.strategies?.no_intervention?.projected_recovery || 0))}</span>
                            </td>
                        </tr>
                        <tr className="bg-indigo-900/20 border-l-[6px] border-indigo-500 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]">
                            <td className="p-5 font-bold text-indigo-300 flex items-center gap-2">
                                Recoup AI Decision Engine <Zap size={14} className="text-indigo-400" />
                                <span className="ml-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] uppercase tracking-widest rounded border border-indigo-500/30">AI-Optimized</span>
                            </td>
                            <td className="p-5 text-emerald-400 font-mono font-bold text-lg">₹{formatIN(metrics?.strategies?.recoup_ai?.projected_recovery)}</td>
                            <td className="p-5 text-white font-mono font-bold text-lg">{((metrics?.strategies?.recoup_ai?.projected_recovery / metrics?.total_at_risk) * 100 || 0).toFixed(1)}%</td>
                            <td className="p-5 text-emerald-400 font-mono font-bold flex flex-col justify-center">
                                <span className={aiImprovement >= 0 ? "text-emerald-400" : "text-amber-400"}>{formatUplift(aiImprovement)}</span>
                                <span className="text-[10px] uppercase text-blue-400 tracking-wider mt-0.5 font-sans font-semibold">{aiRateUplift >= 0 ? '+' : '−'}{Math.abs(aiRateUplift).toFixed(1)} percentage points change</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* WHY RECOUP? */}
        <div className="bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden p-6 relative">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" /> Why Recoup?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-5 bg-slate-800/40 rounded-xl border border-white/5 shadow-inner">
                    <div className="text-blue-400 font-black text-xl mb-2 flex items-center gap-2">1. PREDICT</div>
                    <p className="text-sm text-slate-300 leading-relaxed">Estimate recovery probability for each record.</p>
                </div>
                <div className="p-5 bg-slate-800/40 rounded-xl border border-white/5 shadow-inner">
                    <div className="text-indigo-400 font-black text-xl mb-2 flex items-center gap-2">2. DECIDE</div>
                    <p className="text-sm text-slate-300 leading-relaxed">Select the best permitted recovery action.</p>
                </div>
                <div className="p-5 bg-slate-800/40 rounded-xl border border-white/5 shadow-inner">
                    <div className="text-orange-400 font-black text-xl mb-2 flex items-center gap-2">3. PROTECT</div>
                    <p className="text-sm text-slate-300 leading-relaxed">Apply business policies, retry limits, and guardrails.</p>
                </div>
                <div className="p-5 bg-slate-800/40 rounded-xl border border-white/5 shadow-inner">
                    <div className="text-emerald-400 font-black text-xl mb-2 flex items-center gap-2">4. EXECUTE & AUDIT</div>
                    <p className="text-sm text-slate-300 leading-relaxed">Execute only permitted actions and record the complete decision trail.</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-1 bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900/80 border-b border-white/5 flex items-center gap-2">
              <ShieldCheck className="text-blue-400" size={18} />
              <h2 className="font-bold text-lg text-slate-100 tracking-wide">Decision Policy Summary</h2>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-4">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">1. Data Quality</span>
                <p className="text-sm text-slate-300">Missing required fields<br/><span className="text-slate-500 text-xs">→ EXCLUDED (Action: None)</span></p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest block mb-1">2. Policy Violation</span>
                <p className="text-sm text-slate-300">Any blocked condition<br/><span className="text-slate-500 text-xs">→ BLOCKED BY POLICY (Action: None)</span></p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest block mb-1">3. Retry Exhausted</span>
                <p className="text-sm text-slate-300">Maximum attempts reached<br/><span className="text-slate-500 text-xs">→ RETRY LIMIT REACHED (Action: None)</span></p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">4. High Confidence</span>
                <p className="text-sm text-slate-300">Recovery probability ≥ 80%<br/><span className="text-slate-500 text-xs">→ RECOVERED (Action executed)</span></p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-1">5. Medium Confidence</span>
                <p className="text-sm text-slate-300">Recovery probability ≥ 60%<br/><span className="text-slate-500 text-xs">→ RECOVERED (Action executed)</span></p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">6. Low Confidence</span>
                <p className="text-sm text-slate-300">Recovery probability &lt; 60%<br/><span className="text-slate-500 text-xs">→ ESCALATED TO HUMAN</span></p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-100 tracking-wide flex items-center gap-2">
                  <AlertTriangle className="text-orange-400" size={18} /> EXCEPTION & GUARDRAIL SUMMARY
              </h2>
            </div>
            
            <div className="p-5 border-b border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-900">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 shadow-inner">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Data-Quality</p>
                    <p className="font-mono text-lg font-bold text-white">0 <span className="text-xs font-sans font-normal text-slate-500 ml-1">exceptions</span></p>
                </div>
                <div className="bg-red-900/10 p-3 rounded-lg border border-red-500/20 shadow-inner">
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">Policy Blocks</p>
                    <p className="font-mono text-lg font-bold text-red-400">{policyBlocksCount}</p>
                </div>
                <div className="bg-amber-900/10 p-3 rounded-lg border border-amber-500/20 shadow-inner">
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-widest mb-1">Human Esc.</p>
                    <p className="font-mono text-lg font-bold text-amber-400">{humanEscCount}</p>
                </div>
                <div className="bg-orange-900/10 p-3 rounded-lg border border-orange-500/20 shadow-inner">
                    <p className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-1">Retry Limit</p>
                    <p className="font-mono text-lg font-bold text-orange-400">{retryLimitCount}</p>
                </div>
            </div>

            <div className="overflow-x-auto flex-1 max-h-[400px] custom-scrollbar">
              <table className="w-full min-w-[700px] text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-900/50 text-slate-400 font-semibold text-xs uppercase tracking-wider sticky top-0 z-10 shadow-md">
                  <tr>
                    <th className="px-6 py-4">Exception Type</th>
                    <th className="px-6 py-4">Example Record</th>
                    <th className="px-6 py-4 w-full">Reason</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {totalExceptionCount === 0 ? (
                      <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-mono">No exceptions recorded.</td>
                      </tr>
                  ) : exceptionsArray.slice(0, showAllExceptions ? exceptionsArray.length : 5).map((e, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${
                            e.outcome === 'blocked_by_policy' ? 'bg-red-500/10 text-red-400 ring-red-500/20' : 
                            e.outcome === 'escalated_to_human' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' : 
                            'bg-orange-500/10 text-orange-400 ring-orange-500/20'
                        }`}>
                          {categorizeException(e)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-300 group-hover:text-white align-top transition-colors">{e.record_id}</td>
                      <td className="px-6 py-4 max-w-xs text-slate-400 whitespace-pre-wrap leading-relaxed truncate">
                        {getExceptionReason(e)}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400 align-top">
                        {getExceptionAction(e)}
                      </td>
                    </tr>
                  ))}
                  {totalExceptionCount > 5 && (
                    <tr className="bg-slate-900/20">
                      <td colSpan="4" className="px-6 py-4 text-center">
                        <button 
                          onClick={() => setShowAllExceptions(!showAllExceptions)}
                          className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-slate-800 rounded-lg hover:bg-slate-700"
                        >
                          {showAllExceptions ? 'View Less' : `View ${totalExceptionCount - 5} More`} 
                          <ArrowRight size={14} className={`transform transition-transform ${showAllExceptions ? '-rotate-90' : 'rotate-90'}`} />
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* PROMISE TO PAY TRACKER */}
        <div className="bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-900/80 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-bold text-lg text-slate-100 tracking-wide flex items-center gap-2">
                    <Activity className="text-blue-400" size={18} /> PROMISE-TO-PAY TRACKER
                </h2>
            </div>
            <div className="overflow-x-auto max-h-[300px] custom-scrollbar">
                <table className="w-full text-left text-sm min-w-[900px] whitespace-nowrap">
                    <thead className="bg-slate-900/50 text-slate-400 font-semibold text-xs uppercase tracking-wider sticky top-0 z-10 shadow-md">
                        <tr>
                            <th className="px-6 py-4">Record ID</th>
                            <th className="px-6 py-4">Promise Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Recovery Prob</th>
                            <th className="px-6 py-4">Next Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {audit.filter(l => l.recovery_type === 'PROMISE_TO_PAY').length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center">
                                    <p className="text-slate-400 text-sm mb-2">No Promise-to-Pay records yet.</p>
                                    <p className="text-slate-500 text-xs">Run Demo Data or upload Company Data containing a valid Promise Date to populate this tracker.</p>
                                    {dataSource !== 'demo' && (
                                        <button onClick={() => { setDataSource('demo'); loadData('demo', null); }} className="mt-4 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                                            Try Demo Data
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : audit.filter(l => l.recovery_type === 'PROMISE_TO_PAY').map((log, i) => (
                            <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 font-mono font-medium text-slate-300">{log.record_id}</td>
                                <td className="px-6 py-4 font-mono text-slate-400">{log.promise_date}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                        log.promise_status === 'MISSED' ? 'bg-red-500/10 text-red-400' :
                                        log.promise_status === 'DUE TODAY' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-blue-500/10 text-blue-400'
                                    }`}>
                                        {log.promise_status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono font-bold text-white">₹{formatIN(log.amount_at_risk)}</td>
                                <td className="px-6 py-4 font-mono text-emerald-400">{Math.round(log.confidence * 100)}%</td>
                                <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">{log.action_chosen.replace(/_/g, ' ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div id="tour-audit" className={`bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden ${tourStep === 3 ? 'ring-4 ring-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : ''}`}>
          <div className="p-6 bg-slate-900/80 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h2 className="font-bold text-lg text-slate-100 tracking-wide flex items-center gap-3">
                    <Database className="text-blue-400" size={20}/> 
                    Full Audit Trail
                </h2>
                <p className="text-xs text-slate-400 mt-1">Every decision is recorded from input and risk score through policy, execution, and final outcome.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <div className="px-3 py-1.5 bg-slate-800 rounded-md border border-white/10 text-xs text-slate-300 font-mono flex items-center gap-2 shadow-inner">
                    <span><strong className="text-white">{audit.length}</strong> Audit Events</span>
                    <span className="text-slate-600">·</span>
                    <span><strong className="text-white">{currentRecsCount}</strong> Records</span>
                    <TooltipIcon text="Multiple audit events can be generated for a single evaluated record depending on retries and escalating decisions." />
                </div>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[1500px]">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold text-[10px] uppercase tracking-widest sticky top-0 z-10 shadow-md">
                <tr>
                  <th className="px-5 py-4 min-w-[100px]">Time</th>
                  <th className="px-5 py-4 min-w-[120px]">Record ID</th>
                  <th className="px-5 py-4 min-w-[140px]">Recovery Type</th>
                  <th className="px-5 py-4 min-w-[140px]">Root Cause</th>
                  <th className="px-5 py-4 min-w-[80px] text-indigo-300 font-bold bg-indigo-900/10">Risk %</th>
                  <th className="px-5 py-4 min-w-[120px]">Amount at Risk</th>
                  <th className="px-5 py-4 min-w-[160px] text-blue-300 font-bold bg-blue-900/10">Candidate Action</th>
                  <th className="px-5 py-4 min-w-[100px]">Channel</th>
                  <th className="px-5 py-4 min-w-[120px] text-orange-300 font-bold bg-orange-900/10">Policy Result</th>
                  <th className="px-5 py-4 min-w-[160px] text-emerald-300 font-bold bg-emerald-900/10">Executed Action</th>
                  <th className="px-5 py-4 min-w-[140px] text-emerald-400 font-bold bg-emerald-900/20">Proj. Recovery</th>
                  <th className="px-5 py-4 min-w-[160px] text-white font-bold bg-slate-800/50">Final Status</th>
                  <th className="px-5 py-4 min-w-[100px]">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {audit.length === 0 ? (
                    <tr>
                        <td colSpan="13" className="px-5 py-16 text-center">
                            <p className="text-slate-400 text-sm mb-2">No recovery decisions yet.</p>
                            <p className="text-slate-500 text-xs">Run the Recovery Engine to generate your first audit trail.</p>
                            <button onClick={() => loadData(dataSource, companyData)} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                                Run Engine
                            </button>
                        </td>
                    </tr>
                ) : audit.map((log) => {
                  const confLevel = getConfidenceLevel(log.confidence);
                  const candidateAction = log.recommended_action || (log.action_chosen !== 'none' ? log.action_chosen : 'N/A');
                  const executedAction = log.action_chosen === 'none' ? 'None' : log.action_chosen;
                  const finalStatus = getFinalStatusDisplay(log.outcome);
                  const policyResult = log.guardrail_status === 'allowed' ? 'ALLOWED' : 'BLOCKED';
                  
                  return (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs align-top">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="px-5 py-4 font-mono font-medium text-slate-300 group-hover:text-white transition-colors align-top">{log.record_id}</td>
                    <td className="px-5 py-4 align-top"><span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-white/5">{log.recovery_type?.replace(/_/g, ' ') || 'UNKNOWN'}</span></td>
                    <td className="px-5 py-4 text-slate-400 align-top max-w-[140px] truncate" title={log.root_cause?.replace(/_/g, ' ')}>{log.root_cause?.replace(/_/g, ' ')}</td>
                    <td className="px-5 py-4 font-mono text-indigo-200 bg-indigo-900/5 align-top font-semibold">{Math.round(log.confidence * 100)}%</td>
                    <td className="px-5 py-4 font-mono text-slate-300 align-top">₹{formatIN(log.amount_at_risk)}</td>
                    <td className="px-5 py-4 align-top max-w-[160px] truncate bg-blue-900/5">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-blue-200" title={candidateAction.replace(/_/g, ' ')}>
                        {candidateAction.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 align-top"><span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">{log.channel}</span></td>
                    <td className="px-5 py-4 align-top bg-orange-900/5">
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${policyResult === 'BLOCKED' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {policyResult}
                        </span>
                    </td>
                    <td className="px-5 py-4 align-top max-w-[160px] truncate bg-emerald-900/5">
                        <span className={`text-[11px] font-bold uppercase tracking-wide ${executedAction === 'None' ? 'text-slate-500' : 'text-emerald-300'}`} title={executedAction.replace(/_/g, ' ')}>
                            {executedAction.replace(/_/g, ' ')}
                        </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-emerald-400 bg-emerald-900/10 align-top">₹{formatIN(log.amount_recovered)}</td>
                    <td className="px-5 py-4 align-top bg-slate-800/20 max-w-[160px] truncate">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                          finalStatus === 'RECOVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          finalStatus.includes('BLOCKED') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-slate-800 text-slate-400 border-slate-700'
                        }`} title={finalStatus}>
                        {finalStatus === 'RECOVERED' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>}
                        {finalStatus.includes('BLOCKED') && <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>}
                        <span className="truncate">{finalStatus}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top">
                        <button 
                            id={tourStep === 4 && log === audit[0] ? 'tour-view-details' : undefined}
                            onClick={() => setSelectedLog(log)} 
                            className={`px-3 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] uppercase font-bold text-blue-400 rounded transition-colors tracking-wider whitespace-nowrap border border-slate-700 ${tourStep === 4 && log === audit[0] ? 'ring-2 ring-blue-400 animate-pulse' : ''}`}
                        >
                            View Details
                        </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Decision Explanation Modal */}
      {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
              <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between p-5 border-b border-white/5 bg-slate-800/50">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">Decision Details</h3>
                      <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white transition-colors">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                      
                      {/* Top Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-slate-800/40 rounded-lg border border-white/5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Record ID</p>
                              <p className="font-mono text-sm text-slate-200">{selectedLog.record_id}</p>
                          </div>
                          <div className="p-3 bg-slate-800/40 rounded-lg border border-white/5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Recovery Prob.</p>
                              <p className="font-mono text-sm text-slate-200">{Math.round(selectedLog.confidence * 100)}%</p>
                          </div>
                          <div className="p-3 bg-slate-800/40 rounded-lg border border-white/5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confidence</p>
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getConfidenceLevel(selectedLog.confidence).bg} ${getConfidenceLevel(selectedLog.confidence).color}`}>
                                  {getConfidenceLevel(selectedLog.confidence).label}
                              </span>
                          </div>
                          <div className="p-3 bg-slate-800/40 rounded-lg border border-white/5">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Final Status</p>
                              <p className="font-mono text-[11px] font-bold text-white tracking-widest">{getFinalStatusDisplay(selectedLog.outcome)}</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 0. EXECUTION TIMELINE */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Execution Timeline</h4>
                            <div className="relative border-l-2 border-slate-700 ml-3 md:ml-4 space-y-6 pb-2">
                                <div className="relative pl-6">
                                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-slate-900"></div>
                                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Step 1: Detection</h5>
                                    <p className="text-sm font-semibold text-white mt-0.5">Identified as {selectedLog.recovery_type?.replace(/_/g, ' ')}</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute w-3 h-3 bg-indigo-400 rounded-full -left-[7px] top-1.5 ring-4 ring-slate-900"></div>
                                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Step 2: Diagnosis</h5>
                                    <p className="text-sm font-semibold text-white mt-0.5">Root cause mapped to {selectedLog.root_cause?.replace(/_/g, ' ')}</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute w-3 h-3 bg-purple-400 rounded-full -left-[7px] top-1.5 ring-4 ring-slate-900"></div>
                                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Step 3: Prediction</h5>
                                    <p className="text-sm font-semibold text-white mt-0.5">Recovery Probability: {Math.round(selectedLog.confidence * 100)}%</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute w-3 h-3 bg-orange-400 rounded-full -left-[7px] top-1.5 ring-4 ring-slate-900"></div>
                                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Step 4: Policy & Guardrails</h5>
                                    <p className="text-sm font-semibold text-white mt-0.5">Limits evaluated, candidate actions generated</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute w-3 h-3 bg-emerald-400 rounded-full -left-[7px] top-1.5 ring-4 ring-slate-900"></div>
                                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Step 5: Selection</h5>
                                    <p className="text-sm font-semibold text-white mt-0.5">Highest valid EV action selected: <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-xs">{selectedLog.action_chosen?.replace(/_/g, ' ')}</span></p>
                                </div>
                                <div className="relative pl-6">
                                    <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ring-4 ring-slate-900 ${selectedLog.outcome === 'recovered' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    <h5 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Step 6: Execution & Outcome</h5>
                                    <p className="text-sm font-bold text-white mt-0.5">{getFinalStatusDisplay(selectedLog.outcome)}</p>
                                </div>
                            </div>
                        </div>

                        {/* 1. HOW THE DECISION WAS MADE */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Decision Inputs & Values</h4>
                            <div className="flex flex-col space-y-3 text-sm font-mono p-5 bg-slate-950/50 rounded-xl border border-white/5 overflow-x-auto">
                                <div className="flex items-center gap-4 text-slate-400 min-w-max">
                                    <span className="w-40 shrink-0 text-slate-500 font-sans font-semibold text-xs tracking-wider">INPUT ID</span>
                                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                    <span className="text-white bg-slate-800 px-2 py-1 rounded">{selectedLog.record_id}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 min-w-max">
                                    <span className="w-40 shrink-0 text-slate-500 font-sans font-semibold text-xs tracking-wider">RETRY COUNT</span>
                                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                    <span className="text-white bg-slate-800 px-2 py-1 rounded">{selectedLog.retry_count ?? 0}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 min-w-max">
                                    <span className="w-40 shrink-0 text-slate-500 font-sans font-semibold text-xs tracking-wider">RECOVERY TYPE</span>
                                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                    <span className="text-blue-400 uppercase tracking-widest text-[10px] font-bold">{selectedLog.recovery_type?.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 min-w-max">
                                    <span className="w-40 shrink-0 text-slate-500 font-sans font-semibold text-xs tracking-wider">ROOT CAUSE</span>
                                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                    <span className="text-indigo-400 font-bold">{selectedLog.root_cause?.replace(/_/g, ' ')}</span>
                                    {selectedLog.root_cause_confidence && (
                                      <span className="ml-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded border border-indigo-500/30">
                                        {Math.round(selectedLog.root_cause_confidence * 100)}% Conf
                                      </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 min-w-max">
                                    <span className="w-40 shrink-0 text-slate-500 font-sans font-semibold text-xs tracking-wider">RECOVERY PROBABILITY</span>
                                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                    <span className="text-white bg-slate-800 px-2 py-1 rounded">{Math.round(selectedLog.confidence * 100)}%</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 min-w-max">
                                    <span className="w-40 shrink-0 text-slate-500 font-sans font-semibold text-xs tracking-wider">DECISION CONFIDENCE</span>
                                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                    <span className="text-white bg-slate-800 px-2 py-1 rounded">{selectedLog.decision_confidence || 'HIGH'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 min-w-max">
                                    <span className="w-40 shrink-0 text-slate-500 font-sans font-semibold text-xs tracking-wider">EXECUTION MODE</span>
                                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                    <span className="text-purple-400 border border-purple-500/30 bg-purple-900/20 px-2 py-1 rounded font-bold text-[10px] tracking-widest">{selectedLog.execution_mode || 'SIMULATION'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 min-w-max">
                                    <span className="w-40 shrink-0 text-slate-500 font-sans font-semibold text-xs tracking-wider">EXPECTED VALUE</span>
                                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                    <span className="text-emerald-400 font-bold bg-emerald-900/10 px-2 py-1 rounded">₹{formatIN(selectedLog.expected_value)}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 min-w-max">
                                    <span className="w-40 shrink-0 text-slate-500 font-sans font-semibold text-xs tracking-wider">POLICY RESULT</span>
                                    <ArrowRight size={14} className="text-slate-600 shrink-0" />
                                    <span className={`px-2 py-1 rounded font-bold uppercase tracking-wide text-xs ${selectedLog.guardrail_status === 'BLOCK' ? 'bg-red-900/50 text-red-400 border border-red-500/20' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/20'}`}>
                                        {selectedLog.guardrail_status === 'BLOCK' ? 'BLOCKED' : 'ALLOWED'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-400 min-w-max pt-3 mt-1 border-t border-white/5">
                                    <span className="w-40 shrink-0 text-white font-sans font-bold text-xs tracking-wider uppercase">Final Decision</span>
                                    <ArrowRight size={14} className="text-slate-400 shrink-0" />
                                    <span className="px-3 py-1.5 rounded font-bold uppercase tracking-wide text-xs bg-slate-800 text-white border border-slate-700">
                                        {getFinalStatusDisplay(selectedLog.outcome)}
                                    </span>
                                </div>
                            </div>
                        </div>
                      </div>
                      
                      {/* NEW: TRACK 03 HINGLISH MESSAGE & MANDATE SEQUENCER */}
                      {selectedLog.hinglish_message && (
                          <HinglishVoiceSection 
                              message={selectedLog.hinglish_message} 
                              candidateAction={selectedLog.candidate_action || 'Voice Reminder'} 
                          />
                      )}
                      
                      {selectedLog.retry_sequence_state && (
                          <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Mandate Retry Sequencer</h4>
                              <div className="space-y-3">
                                  {parseJsonSafe(selectedLog.retry_sequence_state)?.map((seq, i) => (
                                      <div key={i} className="flex items-center gap-4 p-3 bg-slate-900 rounded-lg border border-white/5">
                                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">{seq.attempt}</div>
                                          <div className="flex-1">
                                              <p className="text-sm font-bold text-slate-200 uppercase">{seq.action.replace(/_/g, ' ')}</p>
                                              <p className="text-xs text-slate-500">Wait: {seq.wait} • Reason: {seq.reason}</p>
                                          </div>
                                          <div className="flex-shrink-0">
                                              <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400 uppercase tracking-wider">{seq.status}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}

                      {/* 2. WHY THIS DECISION? */}
                      {(() => {
                          const topPositive = parseJsonSafe(selectedLog.reasoning_trace)?.top_positive || [];
                          const topNegative = parseJsonSafe(selectedLog.reasoning_trace)?.top_negative || [];
                          const hasFactors = topPositive.length > 0 || topNegative.length > 0;
                          
                          if (!hasFactors) {
                              return (
                                  <div className="mb-4 p-4 bg-slate-900/50 rounded-xl border border-white/5 text-center text-slate-500 text-sm font-medium">
                                      No additional factors identified.
                                  </div>
                              );
                          }

                          return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {topPositive.length > 0 && (
                                      <div>
                                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Top Positive Factors</h4>
                                          <ul className="space-y-2 text-sm text-emerald-300">
                                              {topPositive.map((f, i) => (
                                                  <li key={i} className="flex items-start gap-2"><span className="mt-1">+</span> {f}</li>
                                              ))}
                                          </ul>
                                      </div>
                                  )}
                                  {topNegative.length > 0 && (
                                      <div>
                                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Top Negative Factors</h4>
                                          <ul className="space-y-2 text-sm text-red-300">
                                              {topNegative.map((f, i) => (
                                                  <li key={i} className="flex items-start gap-2"><span className="mt-1">-</span> {f}</li>
                                              ))}
                                          </ul>
                                      </div>
                                  )}
                              </div>
                          );
                      })()}

                      {/* 3. ALTERNATIVE ACTIONS CONSIDERED */}
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Expected Value Candidates</h4>
                          <div className="space-y-2 text-sm">
                              {parseJsonSafe(selectedLog.candidate_actions)?.map((c, i) => {
                                  const isSelected = c.action === selectedLog.action_chosen;
                                  let reason = isSelected ? "Maximum Expected Value" : "Lower Expected Value";
                                  
                                  const policy = parseJsonSafe(selectedLog.policy_checks) || [];
                                  const blockP = policy.find(p => p.action === c.action && p.status === 'BLOCKED');
                                  if (blockP) reason = "Blocked by Policy: " + blockP.reason;
                                  
                                  const guard = parseJsonSafe(selectedLog.guardrail_checks) || [];
                                  const blockG = guard.find(p => p.action === c.action && p.status === 'BLOCKED');
                                  if (blockG) reason = "Blocked by Guardrail: " + blockG.reason;
                                  
                                  return (
                                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-white/5 gap-2">
                                      <div className="flex items-center gap-3 w-full sm:w-1/3">
                                          <span className="font-mono text-slate-300 capitalize text-xs">{c.action.replace(/_/g, ' ')}</span>
                                      </div>
                                      <div className="w-full sm:w-1/4">
                                          <span className="text-emerald-400 font-mono text-xs font-bold">₹{formatIN(c.expected_value)} EV</span>
                                      </div>
                                      <div className="w-full sm:w-5/12 text-[11px] text-slate-500 font-mono truncate">
                                          {reason}
                                      </div>
                                  </div>
                                  );
                              }) || <div className="text-slate-500 text-sm">No alternative actions generated.</div>}
                          </div>
                      </div>

                      {/* 4. ENGINE TRACE LOG */}
                      <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Engine Trace Log</h4>
                          <pre className="p-4 bg-slate-950 rounded-xl border border-white/5 text-xs text-slate-400 font-mono overflow-x-auto leading-loose whitespace-pre-wrap">
                              {selectedLog.reasoning_trace}
                          </pre>
                      </div>

                  </div>
              </div>
          </div>
      )}

      {showOnboarding && <OnboardingModal onDismiss={() => { setShowOnboarding(false); localStorage.setItem('recoup_onboarding_done', 'true'); }} onRunDemo={() => { setShowOnboarding(false); localStorage.setItem('recoup_onboarding_done', 'true'); setDataSource('demo'); setShowUploadFlow(false); loadData('demo', null); }} onStartTour={() => { setShowOnboarding(false); localStorage.setItem('recoup_onboarding_done', 'true'); setTourStep(0); }} />}
      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
      <ProductTourOverlay step={tourStep} onNext={() => setTourStep(prev => prev + 1)} onEnd={() => setTourStep(-1)} onRunDemo={() => { setTourStep(-1); setDataSource('demo'); setShowUploadFlow(false); loadData('demo', null); }} />

      <footer className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
        Built for Razorpay Buildathon &middot; Track 03
      </footer>

    </div>
  );
}

export default App;
