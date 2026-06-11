import React, { useState } from "react";
import { SAMPLE_LEADS, SampleLead } from "./samples";
import { Trees, Compass, Sparkles, Send, RefreshCw, Layers, DollarSign, Ruler, ArrowLeft } from "lucide-react";
import { AnalysisResponse } from "../types";

interface LeadIntakeProps {
  onAnalysisComplete: (data: AnalysisResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const LeadIntake: React.FC<LeadIntakeProps> = ({
  onAnalysisComplete,
  isLoading,
  setIsLoading
}) => {
  const [leadText, setLeadText] = useState("");
  const [budget, setBudget] = useState<number | "">("");
  const [gardenSize, setGardenSize] = useState<number | "">("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Motivational localized gardening quotes for the loader
  const loadingSteps = [
    "סורק את פניית הלקוח ומנתח מילות מפתח...",
    "מאפיין את סגנון הגינה (מודרני, ים-תיכוני, או אורבני...)",
    "מצליב כמויות חול, שתילים, ודקורציה מול קטלוג ספקים ישראלי...",
    "מחשב הצעת מחיר מלאה ב-NIS כולל עבודה, תשתית וצנרת...",
    "מכין כתב כמויות ('פיצ'יפקעס') ומגדיר משימות לקבלן בשטח...",
    "יוצר המלצות תכנון וצירים מומלצים לפריסת AutoCAD..."
  ];

  const handleSelectSample = (sample: SampleLead) => {
    setLeadText(sample.leadText);
    setBudget(sample.budget);
    setGardenSize(sample.gardenSize);
    setErrorStatus(null);
  };

  const executeAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadText.trim()) return;

    setIsLoading(true);
    setErrorStatus(null);
    setLoadingStep(0);

    // Animate loading text
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await fetch("/api/leads/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadText,
          budget: budget || undefined,
          gardenSize: gardenSize || undefined
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "שגיאה בתקשורת מול השרת");
      }

      const parsedData: AnalysisResponse = await response.json();
      onAnalysisComplete(parsedData);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || "שגיאה בלתי צפויה אירעה בניתוח הנתונים");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      
      {/* Visual Welcome Banner */}
      <div className="bg-gradient-to-l from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Trees className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1 bg-emerald-500/30 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold mb-3 border border-emerald-500/25">
            <Sparkles className="w-3 h-3" /> שלב א': ניהול פניות ואפיון מהיר
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">כלי קליטה אלקטרוני ופס ייצור חכם של פניות</h2>
          <p className="text-emerald-100 mt-2 text-sm sm:text-base leading-relaxed">
            הזן פנייה חופשית בקול או בטקסט (קמפיין פייסבוק, ווטסאפ או שיחה). הסוכן מנתח דרישות צמחייה, מטר מרובע ופרוגרמה, ומפיק הצעת מחיר מסודרת וכתב כמויות מלא לשרקוש ותחילת ביצוע בשניות.
          </p>
        </div>
      </div>

      {isLoading ? (
        /* Loading Animation Screen */
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[350px]">
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-stone-200 border-t-emerald-600 animate-spin"></div>
            <Trees className="w-6 h-6 text-emerald-700 absolute inset-0 m-auto animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 mb-2">הסוכן מייצר תוכנית אוטומטית...</h3>
          <p className="text-emerald-700 text-sm font-medium animate-bounce max-w-md">
            {loadingSteps[loadingStep]}
          </p>
          <div className="mt-8 max-w-xs w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs text-stone-400 mt-2">{loadingStep + 1} מתוך {loadingSteps.length} שלבים בפעולה</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Input Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-stone-800 border-b border-stone-100 pb-3 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              פרטי הלינה החדשים או הפנייה החופשית
            </h3>

            {errorStatus && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-medium">
                ⚠️ {errorStatus}
              </div>
            )}

            <form onSubmit={executeAnalysis} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  תיאור חופשי של בקשת הלקוח וחלומותיו לגינה *
                </label>
                <textarea
                  required
                  rows={6}
                  value={leadText}
                  onChange={(e) => setLeadText(e.target.value)}
                  placeholder="העתק פה את פרטי הווטסאפ או דברו על עימוד הגינה, סוגי הצמחים המבוקשים, בריכות, חיפויים או דשא מתוכנן..."
                  className="w-full rounded-2xl border-stone-200 border p-4 text-stone-800 focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed placeholder:text-stone-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> תקציב מוערך (שקלים מתוכננים)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : "")}
                    placeholder="למשל: 50000"
                    className="w-full rounded-xl border-stone-200 border p-3 text-stone-800 focus:ring-2 focus:ring-emerald-500 text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">יוצלב ויוזן מול מחירוני ספקים</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                    <Ruler className="w-4 h-4 text-emerald-600" /> שטח הגינה במטר מרובע (מ"ר)
                  </label>
                  <input
                    type="number"
                    value={gardenSize}
                    onChange={(e) => setGardenSize(e.target.value ? Number(e.target.value) : "")}
                    placeholder="למשל: 120"
                    className="w-full rounded-xl border-stone-200 border p-3 text-stone-800 focus:ring-2 focus:ring-emerald-500 text-sm focus:outline-none"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">ישתמש כבסיס לחישוב כמויות וקנמ לפריסה</p>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  נתח והפק הצעת מחיר וכתב כמויות
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Presets Sidebar */}
          <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 shadow-xs flex flex-col">
            <h3 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              מצבי בדיקה מהירה ( presets )
            </h3>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              בחר פניית לקוח מוכנה מראש כדי לבחון את הניתוח המהיר והפקת המסמכים האוטומטית:
            </p>

            <div className="space-y-4 flex-1">
              {SAMPLE_LEADS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="w-full text-right p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/20 active:bg-emerald-50/50 transition-all shadow-2xs group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between w-full gap-2 mb-2">
                    <span className="font-bold text-xs text-stone-800 group-hover:text-emerald-800 transition-colors">
                      {sample.title}
                    </span>
                    <span className="text-[10px] bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded-full border border-stone-200 shrink-0">
                      ₪{sample.budget.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {sample.leadText}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-3 self-end opacity-0 group-hover:opacity-100 transition-opacity">
                    טען דוגמה זו <ArrowLeft className="w-3" />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-stone-200/60 pt-4 text-center">
              <span className="text-[11px] text-stone-400 font-mono">
                בנייה אינטואיטיבית • שפת ממשק: עברית / English
              </span>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
