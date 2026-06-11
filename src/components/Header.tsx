import React from "react";
import { Trees, Compass, FileText, CheckSquare, Zap, Layers, Settings } from "lucide-react";

interface HeaderProps {
  currentStep: number;
  setStep: (step: number) => void;
  hasData: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentStep, setStep, hasData }) => {
  const steps = [
    { id: 1, label: "קליטת ליד וניתוח AI", sub: "אפיון דרישות הלקוח", icon: Trees },
    { id: 2, label: "הצעת מחיר וכתב כמויות", sub: "תמחור וסעיפי 'פיצ'יפקעס'", icon: FileText, requireData: true },
    { id: 3, label: "סימולטור אישור לקוח", sub: "חתימה והסכם דיגיטלי", icon: CheckSquare, requireData: true },
    { id: 4, label: "סוכן AutoCAD ושירטוט", sub: "מחולל סקריפטים AutoLISP", icon: Compass },
    { id: 5, label: "הגדרות ואינטגרציות AI", sub: "עותק ל-AI Studio & Make", icon: Settings },
  ];

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 shadow-lg" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-900/40">
              <Layers className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/25 text-emerald-400 font-mono border border-emerald-500/30">
                  AI WORKFLOW V2.5
                </span>
                <span className="text-xs text-stone-400 font-mono">AutoLISP Integration</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                מערכת אוטומציה לאדריכלי נוף וביצוע בשטח
              </h1>
              <p className="text-xs text-stone-400 mt-0.5">
                פס ייצור דיגיטלי מובנה: מניתוח פניית ליד, דרך כתבי כמויות ועד לפריסת AutoCAD מהירה
              </p>
            </div>
          </div>

          {/* Quick Stats / Action Badges */}
          <div className="flex items-center gap-2 self-start md:self-auto text-xs bg-stone-950/80 p-2 rounded-lg border border-stone-800">
            <span className="text-stone-500 font-mono">STATUS:</span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              סוכן AI מחובר
            </span>
            <span className="text-stone-700">|</span>
            <span className="text-teal-300 font-mono">gemini-3.5-flash</span>
          </div>

        </div>

        {/* Workflow Steps Tracker */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isDisabled = s.requireData && !hasData;
            
            return (
              <button
                key={s.id}
                onClick={() => !isDisabled && setStep(s.id)}
                disabled={isDisabled}
                className={`flex items-center gap-3.5 p-3 rounded-xl text-right transition-all duration-200 border ${
                  isActive
                    ? "bg-emerald-950/60 border-emerald-600 text-stone-100 shadow-md shadow-emerald-950/20"
                    : isDisabled
                    ? "bg-stone-900/30 border-stone-800/40 text-stone-600 cursor-not-allowed"
                    : "bg-stone-900/60 border-stone-800 text-stone-300 hover:bg-stone-800/50 hover:border-stone-700"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : isDisabled
                      ? "bg-stone-950 text-stone-700"
                      : "bg-stone-800 text-stone-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-stone-500">0{s.id}.</span>
                    <h3 className="font-semibold text-sm">{s.label}</h3>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">{s.sub}</p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
