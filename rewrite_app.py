import re

with open('d:/Projects/Recoup/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Lucide Imports
content = re.sub(
    r"import { Activity, ShieldCheck, Database, RefreshCw, AlertTriangle, ArrowRight, Zap, Target, UploadCloud, Info, X, GitMerge, FileCheck, CheckCircle2, ListFilter, Sliders } from 'lucide-react';",
    "import { Activity, ShieldCheck, Database, RefreshCw, AlertTriangle, ArrowRight, Zap, Target, UploadCloud, Info, X, GitMerge, FileCheck, CheckCircle2, ListFilter, Sliders, Play, Pause, Square, Copy, Check } from 'lucide-react';",
    content
)

# 2. Add HinglishVoiceSection Component
voice_component = ""
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
            <h4 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">AI Hinglish Voice Recovery</h4>
            
            {/* Metadata Card */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-4 bg-slate-900 border border-slate-700 rounded-xl mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
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
                
                <p className="text-indigo-50 text-base sm:text-lg font-medium leading-relaxed italic mb-6">"{message}"</p>
                
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-indigo-500/20">
                    {!isSpeaking && !isPaused ? (
                        <button onClick={handlePlay} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-sm">
                            <Play size={16} /> Play Voice
                        </button>
                    ) : (
                        <div className="flex items-center gap-2">
                            {isPaused ? (
                                <button onClick={handlePlay} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-sm" aria-label="Resume Hinglish voice">
                                    <Play size={16} /> Resume
                                </button>
                            ) : (
                                <button onClick={handlePause} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors text-sm border border-slate-600" aria-label="Pause Hinglish voice">
                                    <Pause size={16} /> Pause
                                </button>
                            )}
                            <button onClick={handleStop} className="flex items-center gap-2 px-4 py-2 bg-red-950/50 hover:bg-red-900/50 text-red-400 font-bold rounded-lg transition-colors text-sm border border-red-900/50" aria-label="Stop Hinglish voice">
                                <Square size={16} fill="currentColor" /> Stop
                            </button>
                        </div>
                    )}
                    
                    <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 font-bold rounded-lg transition-colors text-sm border border-slate-700 ml-auto" aria-label="Copy Hinglish script">
                        {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />} 
                        {copied ? 'Copied' : 'Copy Script'}
                    </button>
                </div>
            </div>
        </div>
    );
};
""
content = content.replace("function App() {", voice_component + "\nfunction App() {")

# 3. Fix Top Positive/Negative factors logic
factors_search = ""                      {/* 2. WHY THIS DECISION? */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Top Positive Factors</h4>
                              <ul className="space-y-2 text-sm text-emerald-300">
                                  {parseJsonSafe(selectedLog.reasoning_trace)?.top_positive?.map((f, i) => (
                                      <li key={i} className="flex items-start gap-2"><span className="mt-1">+</span> {f}</li>
                                  )) || <li className="text-slate-500">No positive factors found.</li>}
                              </ul>
                          </div>
                          <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Top Negative Factors</h4>
                              <ul className="space-y-2 text-sm text-red-300">
                                  {parseJsonSafe(selectedLog.reasoning_trace)?.top_negative?.map((f, i) => (
                                      <li key={i} className="flex items-start gap-2"><span className="mt-1">-</span> {f}</li>
                                  )) || <li className="text-slate-500">No negative factors found.</li>}
                              </ul>
                          </div>
                      </div>""

factors_replace = ""                      {/* 2. WHY THIS DECISION? */}
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
                      })()}""
content = content.replace(factors_search, factors_replace)

# 4. Replace Hinglish voice section
hinglish_search = ""                      {/* NEW: TRACK 03 HINGLISH MESSAGE & MANDATE SEQUENCER */}
                      {selectedLog.hinglish_message && (
                          <div>
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Hinglish Voice Recovery Simulation</h4>
                              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                                      <Activity size={16} />
                                      <span className="text-xs font-bold uppercase tracking-wider">Generated Message</span>
                                  </div>
                                  <p className="text-emerald-100 font-medium italic">"{selectedLog.hinglish_message}"</p>
                              </div>
                          </div>
                      )}""

hinglish_replace = ""                      {/* NEW: TRACK 03 HINGLISH MESSAGE & MANDATE SEQUENCER */}
                      {selectedLog.hinglish_message && (
                          <HinglishVoiceSection message={selectedLog.hinglish_message} candidateAction={selectedLog.candidate_action || 'Voice Reminder'} />
                      )}""
content = content.replace(hinglish_search, hinglish_replace)


with open('d:/Projects/Recoup/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
