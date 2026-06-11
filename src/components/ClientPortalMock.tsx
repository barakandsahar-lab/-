import React, { useState } from "react";
import { AnalysisResponse } from "../types";
import { CheckSquare, ShieldCheck, PenTool, Smartphone, RefreshCw, Send, CheckCircle2 } from "lucide-react";

interface ClientPortalMockProps {
  data: AnalysisResponse;
  onApprovalStatusChange: (isApproved: boolean) => void;
  isApproved: boolean;
}

export const ClientPortalMock: React.FC<ClientPortalMockProps> = ({
  data,
  onApprovalStatusChange,
  isApproved
}) => {
  const [typedName, setTypedName] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);
  const [phoneSubmitted, setPhoneSubmitted] = useState(false);

  const calculateTotal = () => {
    const total = data.quoteItems.reduce((acc, item) => acc + item.totalPrice, 0) * 1.17;
    return Math.round(total);
  };

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedName.trim()) return;
    setSignatureDone(true);
    onApprovalStatusChange(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-stone-800" dir="rtl">
      
      {/* Simulation Info (Admin View) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 shadow-2xs">
          <span className="text-[10px] bg-stone-200/80 text-stone-600 font-mono font-bold px-2.5 py-1 rounded-full border border-stone-300">
            סימולטור אישור לקוח
          </span>
          <h3 className="text-lg font-bold text-stone-950 mt-2">מסך הלקוח הסופי להזמנה</h3>
          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
            כאן תוכל לבחון באיזה אופן הלקוח מקבל את הצעת המחיר לנייד שלו. הוא רואה פירוט מלא, סכום סופי כולל מע&quot;מ, ויכול לבצע חתימה ידנית או מוקלדת מיידית.
          </p>
          <p className="text-xs text-stone-500 mt-1 pb-4 border-b border-stone-200">
            ברגע שהלקוח חותם, סטטוס משימת הפיתוח מתחלף אוטומטית ל-&quot;מאושר בידי לקוח&quot; ומקפיץ הוראות עבודה וקוד AutoCAD!
          </p>

          <div className="pt-4 space-y-3 text-xs">
            <span className="font-bold text-stone-700 block">סטטוס פרויקט נוכחי:</span>
            {isApproved ? (
              <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                אושר ונחתם דיגיטלית!
              </div>
            ) : (
              <div className="bg-amber-50 text-amber-800 p-3.5 rounded-xl border border-amber-200 font-bold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
                ממתין לחתימת הלקוח
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Portal Screen (Smartphone frame Mock) */}
      <div className="lg:col-span-2 flex justify-center">
        <div className="w-full max-w-md bg-stone-950 rounded-[40px] p-4.5 shadow-2xl border-4 border-stone-800 relative">
          
          {/* Mobile phone upper speaker and camera circle notch */}
          <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-1.5 z-40 bg-stone-950 px-4 py-1.5 rounded-full">
            <div className="w-2.5 h-2.5 rounded-full bg-stone-800"></div>
            <div className="w-12 h-1 rounded-full bg-stone-800"></div>
          </div>

          <div className="bg-stone-50 rounded-[30px] overflow-hidden min-h-[620px] text-stone-800 flex flex-col justify-between border border-stone-900 shadow-inner mt-4 relative">
            
            {/* Mobile Header */}
            <div className="bg-stone-900 text-white p-4 pt-6 text-center shadow-md">
              <span className="text-[10px] text-emerald-300 font-mono tracking-widest font-bold">PORTAL COOP</span>
              <h4 className="text-sm font-extrabold mt-0.5">אישור תוכנית ועיצוב גינה פמיליה</h4>
              <p className="text-[9px] text-stone-400">הוגש באהבה על ידי Landscape Automation Studio</p>
            </div>

            {/* Content box */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 max-h-[460px]">
              
              {/* Introduction */}
              <div className="bg-white rounded-2xl p-3.5 border border-stone-200 text-xs shadow-3xs leading-relaxed">
                <span className="font-bold text-stone-800">שלום {data.clientName || "אורח"},</span>
                <p className="mt-1 text-stone-600">
                  איזה כיף לעמוד בפני הגשמת הגינה החדשה שלך! להלן הצעת המחיר המתוכננת לגינה המעוצבת בסגנון <span className="font-bold text-emerald-800">{data.styleDescription}</span> עבור שטח של <span className="font-bold font-mono">{data.gardenSizeSqm} מ&quot;ר</span>.
                </p>
              </div>

              {/* Aggregated List of items */}
              <div className="bg-white rounded-2xl border border-stone-200 p-3 text-xs shadow-3xs space-y-2">
                <span className="font-bold text-[11px] text-stone-400 block border-b border-stone-100 pb-1">פירוט סעיפי העבודה המרכזיים:</span>
                
                <div className="divide-y divide-stone-100 space-y-2">
                  {data.quoteItems.slice(0, 5).map((item, id) => (
                    <div key={id} className="flex justify-between items-start text-[11px] pt-1.5">
                      <div>
                        <span className="font-bold text-stone-800 block leading-tight">{item.title}</span>
                        <span className="text-[10px] text-stone-400 font-mono">כמות: {item.quantity} {item.unit}</span>
                      </div>
                      <span className="font-bold text-stone-700 font-mono shrink-0">₪{item.totalPrice.toLocaleString()}</span>
                    </div>
                  ))}
                  {data.quoteItems.length > 5 && (
                    <div className="text-[10px] text-emerald-700 font-semibold text-center pt-2">
                      + עוד {data.quoteItems.length - 5} סעיפים נוספים המופיעים בהסכם המקורי
                    </div>
                  )}
                </div>

                <div className="border-t border-stone-200 pt-3 flex justify-between items-center bg-stone-50 -mx-3 -mb-3 p-3 rounded-b-2xl">
                  <div>
                    <span className="text-[9px] text-stone-500 uppercase block font-semibold leading-none">סה&quot;כ כולל מע&quot;מ:</span>
                    <span className="text-stone-400 text-[10px]">17% מע&quot;מ מוסדר כחוק</span>
                  </div>
                  <span className="text-lg font-black text-emerald-700 font-mono">₪{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {/* Special Design Notes */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold block text-xs">📋 שיקולי האדריכל שתכנן עבורך:</span>
                <p className="mt-1">{data.designerSpecialNotes}</p>
              </div>

              {/* Underneath Authorization Contract Panel */}
              {isApproved ? (
                <div className="bg-emerald-600 rounded-3xl p-5 text-white text-center shadow-lg animate-bounce">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-2 text-white" />
                  <span className="font-extrabold text-sm block">חתימה אושרה בהצלחה!</span>
                  <p className="text-[10px] text-emerald-100 mt-1">המסמך נחתם והצטרף אוטומטית לקבצי הפרוגרמה. תנאי הביצוע והביצוע נכנסו לפועל.</p>
                  <p className="text-[10px] font-mono text-emerald-200 mt-1.5">SIGNED BY: {typedName}</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm text-xs">
                  <span className="font-bold text-stone-800 block mb-2 border-b border-stone-100 pb-1">מתחם חתימה דיגיטלית מהירה:</span>
                  
                  <form onSubmit={handleApprove} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-stone-500 mb-1">הכנס שם מלא לחתימה אלקטרונית *</label>
                      <input
                        type="text"
                        required
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        placeholder="שם וחתימה (למשל: ברק כהן)"
                        className="w-full text-xs rounded-lg border border-stone-200 p-2 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-stone-50"
                      />
                    </div>

                    <div className="border border-stone-200 rounded-lg p-3 bg-stone-50 text-center relative select-none">
                      <span className="text-[10px] text-stone-400 block mb-1">שרטט חתימה על המסך (אופציונלי)</span>
                      <div className="w-full h-12 border border-dashed border-stone-300 rounded-md flex items-center justify-center text-stone-300 hover:text-stone-400 cursor-crosshair">
                        <PenTool className="w-4 h-4 mr-1" />
                        לחץ כאן לחתימה דיגיטלית
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-stone-900 hover:bg-stone-950 text-white font-bold py-2.5 rounded-xl transition-all cursor-pointer text-xs"
                    >
                      לחץ לאישור וביצוע ההסכם
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Mobile Footer bar */}
            <div className="bg-stone-100 border-t border-stone-200 p-2 text-center text-[9px] text-stone-400">
              © Landscape Automation System • פרוגרמה מאובטחת SSL
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
