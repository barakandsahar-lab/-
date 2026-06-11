import React, { useState, useEffect } from "react";
import { QuoteItem, AnalysisResponse } from "../types";
import { FileText, Plus, Trash2, Edit2, CheckCircle2, ChevronRight, DollarSign, Calculator, Percent } from "lucide-react";

interface QuoteBreakdownProps {
  data: AnalysisResponse;
  onUpdateData: (updated: AnalysisResponse) => void;
  onNextStep: () => void;
}

export const QuoteBreakdown: React.FC<QuoteBreakdownProps> = ({
  data,
  onUpdateData,
  onNextStep
}) => {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [includeVat, setIncludeVat] = useState(true);
  const [discountPercent, setDiscountPercent] = useState(0);

  // Form states for new custom item insertion
  const [newItemCategory, setNewItemCategory] = useState("צמחייה");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState("יחידה");
  const [newItemPrice, setNewItemPrice] = useState<number>(100);
  const [newItemNotes, setNewItemNotes] = useState("");

  const categories = ["תשתיות ועפר", "השקיה", "פיתוח ועץ", "צמחייה", "תאורה", "פיקוח"];

  useEffect(() => {
    if (data && data.quoteItems) {
      setItems(data.quoteItems);
    }
  }, [data]);

  const handleUpdateItem = (index: number, field: keyof QuoteItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Automatically recalculate total price if quantity or price updates
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setItems(updatedItems);
    onUpdateData({ ...data, quoteItems: updatedItems });
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onUpdateData({ ...data, quoteItems: updatedItems });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const item: QuoteItem = {
      category: newItemCategory,
      title: newItemTitle,
      quantity: newItemQty,
      unit: newItemUnit,
      unitPrice: newItemPrice,
      totalPrice: newItemQty * newItemPrice,
      notes: newItemNotes || undefined
    };

    const updated = [...items, item];
    setItems(updated);
    onUpdateData({ ...data, quoteItems: updated });

    // Reset fields
    setNewItemTitle("");
    setNewItemNotes("");
    setNewItemQty(1);
    setNewItemPrice(100);
  };

  // Cost calculations
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const vatAmount = includeVat ? taxableAmount * 0.17 : 0;
  const grandTotal = taxableAmount + vatAmount;

  return (
    <div className="space-y-8 animate-fade-in text-stone-800" dir="rtl">
      
      {/* Step Header */}
      <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-stone-200/80 text-stone-600 font-mono font-bold px-2.5 py-1 rounded-full border border-stone-300">
            ניהול עסקי ומסמכים
          </span>
          <h2 className="text-xl font-extrabold text-stone-900 mt-2">הצעת מחיר מפורטת ללקוח: {data.clientName}</h2>
          <p className="text-xs text-stone-500 mt-1">
            סגנון מתוכנן: <span className="font-semibold text-emerald-800">{data.styleDescription}</span> • שטח גינה: <span className="font-mono text-stone-700">{data.gardenSizeSqm} מ&quot;ר</span> • זמן ביצוע משוער: <span className="font-semibold text-stone-700">{data.estimatedWeeks} שבועות</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNextStep}
            className="bg-emerald-700 hover:bg-emerald-800 cursor-pointer text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md hover:shadow-emerald-700/20 transition-all flex items-center gap-2"
          >
            שלח לאישור לקוח דיגיטלי
            <ChevronRight className="w-4 h-4 transform rotate-180" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Columns: Interactive Quote Table */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm overflow-hidden">
            <h3 className="text-base font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-3">
              <FileText className="w-5 h-5 text-emerald-600 animate-bounce" />
              סעיפי ההצעה (עריכה חיה ואינטראקטיבית)
            </h3>

            {/* Quote Categories Blocks */}
            <div className="space-y-6">
              {categories.map((cat) => {
                const catItems = items.filter((i) => i.category === cat);
                if (catItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="bg-stone-50/80 px-3 py-1.5 rounded-lg border-r-4 border-emerald-600 flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">{cat}</span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {catItems.length} סעיפים • ₪{catItems.reduce((acc, c) => acc + c.totalPrice, 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead>
                          <tr className="text-stone-400 border-b border-stone-100 uppercase tracking-wider text-[10px]">
                            <th className="py-2 pr-2">תיאור השירות / החומר</th>
                            <th className="py-2 text-center w-16">כמות</th>
                            <th className="py-2 text-center w-16">יחידה</th>
                            <th className="py-2 text-left w-24">מחיר יח&apos; (₪)</th>
                            <th className="py-2 text-left w-24">סה&quot;כ (₪)</th>
                            <th className="py-2 text-center w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {items.map((item, originalIndex) => {
                            if (item.category !== cat) return null;
                            return (
                              <tr key={originalIndex} className="hover:bg-stone-50/40 group">
                                <td className="py-3 pr-2">
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => handleUpdateItem(originalIndex, "title", e.target.value)}
                                    className="w-full font-medium text-stone-800 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-emerald-600 focus:outline-none focus:bg-white px-1 py-0.5 rounded transition-all"
                                  />
                                  {item.notes && (
                                    <input
                                      type="text"
                                      value={item.notes}
                                      onChange={(e) => handleUpdateItem(originalIndex, "notes", e.target.value)}
                                      className="block text-[10px] text-stone-400 font-mono mt-1 bg-transparent border-b border-transparent hover:border-stone-200 focus:outline-none w-full"
                                    />
                                  )}
                                </td>
                                
                                <td className="py-3 text-center">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateItem(originalIndex, "quantity", Number(e.target.value))}
                                    className="w-12 text-center font-mono border border-stone-200 rounded px-1 py-0.5"
                                  />
                                </td>

                                <td className="py-3 text-center text-stone-500 font-medium font-mono text-[11px]">
                                  {item.unit}
                                </td>

                                <td className="py-3 text-left">
                                  <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => handleUpdateItem(originalIndex, "unitPrice", Number(e.target.value))}
                                    className="w-18 text-left font-mono border border-stone-200 rounded px-1 py-0.5"
                                  />
                                </td>

                                <td className="py-3 text-left font-bold text-stone-800 font-mono">
                                  ₪{item.totalPrice.toLocaleString()}
                                </td>

                                <td className="py-3 text-center">
                                  <button
                                    onClick={() => handleDeleteItem(originalIndex)}
                                    className="text-stone-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-1"
                                    title="מחק סעיף"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form to insert dynamic items in catalog */}
          <div className="bg-stone-50 rounded-3xl border border-stone-200 p-6 shadow-xs">
            <h4 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              הוספת סעיף מחושב חדש להצעה
            </h4>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="שם העבודה / המוצר (למשל: דשא סינטטי קינג 44 מיל)"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="יחידה (מ''ר, קוב, יח')"
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 text-center focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="כמות"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 text-center focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="number"
                  placeholder="מחיר ליחידה ₪"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value))}
                  className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 text-center focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="הערה לקבלן או מקור ספק (אופציונלי)"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 focus:outline-none"
                />
              </div>

              <div className="flex items-end justify-end">
                <button
                  type="submit"
                  className="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs p-2.5 rounded-xl border border-stone-900 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  הוסף סעיף <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Dynamic Pricing Summary Panel */}
        <div className="space-y-6">
          <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden border border-stone-800">
            <h3 className="text-base font-bold flex items-center gap-2 border-b border-stone-800 pb-3">
              <Calculator className="w-5 h-5 text-emerald-400" />
              סיכום תקציבי ואנליטי
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>סך סעיפי הבסיס לפני מע&quot;מ:</span>
                <span className="font-mono text-stone-100">₪{subtotal.toLocaleString()}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>הנחה מיוחדת לפרויקט:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-12 bg-stone-950 font-mono text-xs rounded border border-stone-800 text-center text-teal-300 py-0.5 focus:outline-none"
                    />
                    <span className="font-mono">%</span>
                  </div>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-xs text-rose-300 font-mono pr-2">
                    <span>- גובה ההנחה בשקלים:</span>
                    <span>₪{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-800 pt-3">
                <span className="flex items-center gap-1.5">
                  חישוב מע&quot;מ ישראלי (17%):
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeVat}
                    onChange={(e) => setIncludeVat(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:left-auto after:content-[''] after:absolute after:top-[2px] after:right-[18px] after:bg-stone-100 after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {includeVat && (
                <div className="flex items-center justify-between text-xs text-stone-400 font-mono pr-2">
                  <span>+ מרכיב המע&quot;מ:</span>
                  <span>₪{vatAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-stone-800 pt-4 flex flex-col gap-1">
                <span className="text-xs text-stone-400">סה&quot;כ הצעת מחיר סופית ללקוח:</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  ₪{Math.round(grandTotal).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-stone-950/50 rounded-xl p-3 border border-stone-800 text-[11px] text-stone-400 space-y-1.5 leading-relaxed">
              <p className="font-bold text-amber-500">💡 הערת האדריכל המלווה:</p>
              <p>{data.designerSpecialNotes}</p>
            </div>

            <button
               onClick={onNextStep}
               className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              אישור והמשך לקליטת לקוח
              <CheckCircle2 className="w-5 h-5" />
            </button>
          </div>

          {/* Quick PDF/Excel mock visual indicators */}
          <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-sm text-xs text-stone-500 space-y-3">
            <span className="font-bold text-stone-800 block">ערוצי הפקה נוספים:</span>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => alert("הפקת קובץ PDF מוכנה בקבוצת הניהול, נשלחה לסנכרון מול Drive לקוח")}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-center font-medium hover:text-stone-800 transition-colors"
              >
                📥 הורדה כ-PDF
              </button>
              <button 
                onClick={() => alert("ייצוא גיליון אקסל (CSV) מוכן, נשמר בתיקיית הלקוח")}
                className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-center font-medium hover:text-stone-800 transition-colors"
              >
                📊 ייצוא ל-Excel
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
