import re

with open('d:/Projects/Recoup/frontend/src/FTUX.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports for createPortal and useEffect
content = content.replace(
    "import React, { useState } from 'react';",
    "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';"
)

# Add useScrollLock hook at the top
scroll_hook = ""
const useScrollLock = () => {
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);
};
""
content = content.replace("export const OnboardingModal", scroll_hook + "\nexport const OnboardingModal")

# Update OnboardingModal to use Portal and scroll lock
onboarding_replace = ""export const OnboardingModal = ({ onDismiss, onStartTour, onRunDemo }) => {
    useScrollLock();
    return createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">""
content = content.replace("export const OnboardingModal = ({ onDismiss, onStartTour, onRunDemo }) => (\n    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">", onboarding_replace)
content = content.replace("        </div>\n    </div>\n);\n", "        </div>\n    </div>,\n    document.body\n    );\n};\n", 1)

# Update HowItWorksModal to use Portal, scroll lock, and max-h-[calc(100vh-32px)]
howitworks_replace = ""export const HowItWorksModal = ({ onClose }) => {
    useScrollLock();
    
    // Add escape key listener
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[calc(100vh-32px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">""
content = content.replace("export const HowItWorksModal = ({ onClose }) => (\n    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">\n        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">", howitworks_replace)
content = content.replace("        </div>\n    </div>\n);\n", "        </div>\n    </div>,\n    document.body\n    );\n};\n", 1) # Note, this replaces the second instance if it matched correctly. Let's make sure.

# Update ProductTourOverlay
tour_search = "    return (\n        <div className="fixed bottom-8 right-8 z-[100] bg-slate-800 border border-blue-500/50 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-in slide-in-from-bottom-8 duration-300 ring-4 ring-blue-500/20">"
tour_replace = ""    useScrollLock();
    return createPortal(
        <div className="fixed z-[100] bottom-4 left-4 right-4 w-[calc(100vw-32px)] sm:w-[380px] sm:left-auto sm:right-8 sm:bottom-8 max-h-[calc(100vh-32px)] overflow-y-auto bg-slate-800 border border-blue-500/50 rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-8 duration-300 ring-4 ring-blue-500/20">""
content = content.replace(tour_search, tour_replace)
content = content.replace("        </div>\n    );\n};", "        </div>,\n    document.body\n    );\n};")

with open('d:/Projects/Recoup/frontend/src/FTUX.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
