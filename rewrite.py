import re

with open('d:/Projects/Recoup/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
content = content.replace(
    "import UploadFlow from './UploadFlow';",
    "import UploadFlow from './UploadFlow';\nimport { OnboardingModal, HowItWorksModal, ProductTourOverlay, HelpDropdown, DemoScenarios } from './FTUX';"
)

# Add states
state_insertion = ""  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [tourStep, setTourStep] = useState(-1);
  const [hasRunOnce, setHasRunOnce] = useState(false);

  useEffect(() => {
      const isFirst = !localStorage.getItem('recoup_onboarding_done');
      if (isFirst) setShowOnboarding(true);
      const ranOnce = !!localStorage.getItem('recoup_first_run_done');
      if (ranOnce) setHasRunOnce(true);
  }, []);
""
content = content.replace("  const hasFetchedDemo = useRef(false);", "  const hasFetchedDemo = useRef(false);\n" + state_insertion)

# Modify loadData
load_data_insertion = ""      const metricsData = await res.json();
      setRunId(metricsData.run_id);
      setAllMetrics(metricsData);
      if (!localStorage.getItem('recoup_first_run_done')) {
          localStorage.setItem('recoup_first_run_done', 'true');
          setHasRunOnce(true);
      }""
content = content.replace("      const metricsData = await res.json();\n      setRunId(metricsData.run_id);\n      setAllMetrics(metricsData);", load_data_insertion)

# Empty states Promise
content = content.replace(
    "No promises found in current view.",
    "No Promise-to-Pay records yet. Run Demo Data or upload Company Data containing a valid Promise Date to populate this tracker."
)

# Empty states Audit
content = content.replace(
    "No audit trail records found.",
    "No recovery decisions yet. Run the Recovery Engine to generate your first audit trail."
)

# Header modifications for HelpDropdown
header_search = "            <p className="text-[10px] md:text-xs text-blue-400 font-semibold tracking-widest uppercase truncate">AI Revenue Recovery Agent | Predict +' Decide +' Protect +' Recover</p>\n          </div>\n        </div>"
header_replace = header_search + "\n        <HelpDropdown onTour={() => setTourStep(0)} onHowItWorks={() => setShowHowItWorks(true)} onDemo={() => { setDataSource('demo'); setShowUploadFlow(false); loadData('demo', null); }} onUpload={() => setShowUploadFlow(true)} />"
content = content.replace(header_search, header_replace)

# Inject Modals
modal_injection = ""
      {showOnboarding && <OnboardingModal onDismiss={() => { setShowOnboarding(false); localStorage.setItem('recoup_onboarding_done', 'true'); }} onRunDemo={() => { setShowOnboarding(false); localStorage.setItem('recoup_onboarding_done', 'true'); setDataSource('demo'); setShowUploadFlow(false); loadData('demo', null); }} onStartTour={() => { setShowOnboarding(false); localStorage.setItem('recoup_onboarding_done', 'true'); setTourStep(0); }} />}
      {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
      <ProductTourOverlay step={tourStep} onNext={() => setTourStep(prev => prev + 1)} onEnd={() => setTourStep(-1)} onRunDemo={() => { setTourStep(-1); setDataSource('demo'); setShowUploadFlow(false); loadData('demo', null); }} />
""
content = content.replace("      <header className="bg-slate-900/50", modal_injection + "      <header className="bg-slate-900/50")

# Inject Contextual Help After Run
banner_injection = ""
          {hasRunOnce && (
              <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl p-3 mb-6 text-center text-emerald-200 text-sm flex items-center justify-center gap-2 animate-in slide-in-from-top-4">
                  Recovery analysis complete <CheckCircle2 size={16} className="text-emerald-400" /> Review the metrics below, then open View Details on any record to understand why the agent selected that action.
                  <button onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})} className="ml-4 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 rounded font-bold uppercase tracking-wider text-[10px] transition-colors">View Audit Trail</button>
                  <button onClick={() => setHasRunOnce(false)} className="ml-2 text-emerald-500 hover:text-emerald-300"><X size={14}/></button>
              </div>
          )}
""
content = content.replace("          {/* TRACK 03 READINESS SUMMARY */}", banner_injection + "          {/* TRACK 03 READINESS SUMMARY */}")

# Inject Demo Scenarios
content = content.replace(
    "          {/* TRACK 03 READINESS SUMMARY */}",
    "          <DemoScenarios />\n          {/* TRACK 03 READINESS SUMMARY */}"
)

# Add Tour IDs to elements
content = content.replace("className={"flex items-center gap-2 bg-slate-900/80 p-1.5", "id="tour-data-source" className={"flex items-center gap-2 bg-slate-900/80 p-1.5 ")
content = content.replace("className="group relative flex items-center gap-2 px-5 md:px-6 py-2.5", "id="tour-run-engine" className={"group relative flex items-center gap-2 px-5 md:px-6 py-2.5 ")
content = content.replace("className="bg-slate-950/50 rounded-2xl p-6 border border-red-500/10 relative overflow-hidden", "id="tour-metrics" className={"bg-slate-950/50 rounded-2xl p-6 border border-red-500/10 relative overflow-hidden ")
content = content.replace("className="bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden", "id="tour-audit" className={"bg-slate-900/40 rounded-2xl border border-white/10 shadow-xl overflow-hidden ")

# Tooltips
content = content.replace("Total At Risk</p>", "Total At Risk <TooltipIcon text="Total amount potentially lost if affected accounts are not successfully recovered." /></p>")
content = content.replace("Total Recovered</p>", "Total Recovered <TooltipIcon text="Expected monetary recovery generated by the selected recovery action." /></p>")
content = content.replace("Net Expected Recovery</p>", "Net Expected Recovery <TooltipIcon text="Estimated net recovery after probability, intervention effectiveness, and intervention cost." /></p>")
content = content.replace("AI Recovery Lift</p>", "AI Recovery Lift <TooltipIcon text="Incremental recovery impact attributed to the AI strategy relative to the baseline." /></p>")

with open('d:/Projects/Recoup/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
