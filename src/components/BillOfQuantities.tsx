import React, { useState, useEffect } from "react";
import { BillOfQuantitiesItem, AnalysisResponse } from "../types";
import { CheckSquare, Sparkles, Plus, Layers, Truck, Package, ShoppingCart } from "lucide-react";

interface BillOfQuantitiesProps {
  data: AnalysisResponse;
  onUpdateData: (updated: AnalysisResponse) => void;
}

export const BillOfQuantities: React.FC<BillOfQuantitiesProps> = ({
  data,
  onUpdateData
}) => {
  const [items, setItems] = useState<BillOfQuantitiesItem[]>([]);
  
  // Custom new item addition
  const [newCode, setNewCode] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [newUnit, setNewUnit] = useState("יחידה");

  useEffect(() => {
    if (data && data.billOfQuantities) {
      setItems(data.billOfQuantities);
    }
  }, [data]);

  const handleUpdateStatus = (index: number, newStatus: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], status: newStatus };
    setItems(updated);
    onUpdateData({ ...data, billOfQuantities: updated });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const code = newCode.trim() || `BOQ-${100 + items.length}`;
    const newItem: BillOfQuantitiesItem = {
      itemCode: code,
      description: newDesc,
      sku: newSku || "ספק כללי",
      quantityNeeded: newQty,
      unit: newUnit,
      status: "טרם הוזמן"
    };

    const updated = [...items, newItem];
    setItems(updated);
    onUpdateData({ ...data, billOfQuantities: updated });

    setNewCode("");
    setNewDesc("");
    setNewSku("");
    setNewQty(1);
  };

  // Stats
  const totalItems = items.length;
  const orderedItems = items.filter(i => i.status !== "טרם הוזמן").length;
  const deliveredItems = items.filter(i => i.status === "סופק בשטח" || i.status === "בשטח").length;
  const progressPercent = totalItems > 0 ? Math.round((deliveredItems / totalItems) * 100) : 0;

  // Status visual configurations
  const statusOptions = [
    { value: "טרם הוזמן", label: "טרם הוזמן", color: "bg-stone-100 text-stone-600 border-stone-300" },
    { value: "הוזמן", label: "הוזמן מהספק", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { value: "בדרך לשטח", label: "בדרך לשטח", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { value: "סופק בשטח", label: "סופק בשטח", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6 animate-fade-in" dir="rtl">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-600 animate-pulse" />
            כתב כמויות לביצוע בשטח (&quot;פיצ&apos;יפקעס&quot;)
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            רשימה מפורטת של חומרים, צמחים ואביזרי בנייה עם מעקב סטטוס והזמנות עבור הצוות המבצע בשטח.
          </p>
        </div>

        {/* Progress Tracker Widget */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex items-center gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between font-bold text-stone-700 gap-8">
              <span>אספקה בשטח:</span>
              <span className="font-mono text-emerald-700">{deliveredItems}/{totalItems} ({progressPercent}%)</span>
            </div>
            <div className="w-40 bg-stone-200 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[10px] text-stone-400 font-mono text-left select-none">
            Ordered: {orderedItems}
          </div>
        </div>
      </div>

      {/* Grid: BOQ List */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="text-stone-400 border-b border-stone-100 uppercase tracking-wider text-[10px]">
              <th className="py-2 pr-2">קוד פריט</th>
              <th className="py-2">תיאור ואפיון הפריט</th>
              <th className="py-2 text-center">כמות</th>
              <th className="py-2 text-center">יחידה</th>
              <th className="py-2">ספק / הערה</th>
              <th className="py-2 text-left pl-2">סטטוס הזמנה</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-stone-50/40 transition-colors">
                <td className="py-3 pr-2 font-mono text-stone-500 font-semibold">{item.itemCode}</td>
                <td className="py-3 font-medium text-stone-800">{item.description}</td>
                <td className="py-3 text-center font-bold font-mono">{item.quantityNeeded}</td>
                <td className="py-3 text-center text-stone-500 font-mono">{item.unit}</td>
                <td className="py-3 text-stone-500 font-medium">{item.sku}</td>
                <td className="py-3 text-left pl-2">
                  <div className="flex items-center justify-end gap-1.5">
                    <select
                      value={item.status}
                      onChange={(e) => handleUpdateStatus(index, e.target.value)}
                      className={`text-[11px] font-semibold rounded-lg border px-2.5 py-1.5 focus:outline-none transition-colors ${
                        statusOptions.find(o => o.value === item.status)?.color || "bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Append new BOQ item directly */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4">
        <span className="font-bold text-xs text-stone-800 block mb-3">הוספת דרישת רכש / פריט שתילה לכתב הכמויות:</span>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <input
              type="text"
              placeholder="קוד (למשל: IRR-05)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              placeholder="תיאור הפריט לקנייה באליאנס / וולקן..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="כמות ויחידה (למשל: 5 גלילים)"
              value={`${newQty} ${newUnit}`}
              onChange={(e) => {
                const val = e.target.value;
                const match = val.match(/^(\d+)\s*(.*)$/);
                if (match) {
                  setNewQty(Number(match[1]));
                  setNewUnit(match[2] || "יחידה");
                } else {
                  setNewUnit(val);
                }
              }}
              className="w-full text-xs rounded-xl border border-stone-200 bg-white p-2.5 focus:outline-none text-center"
            />
          </div>
          <div className="flex items-end justify-end">
            <button
              type="submit"
              className="w-full bg-stone-800 hover:bg-stone-900 border border-stone-900 text-white font-bold text-xs p-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
            >
              הוסף רכש <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Integration Tips */}
      <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 flex gap-3 text-emerald-800 text-xs leading-relaxed">
        <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-emerald-900">🔗 חיבור למחסן ספקים (Make / automation):</span>
          <p className="mt-0.5">
            בלחיצת כפתור, פלטפורמת האוטומציה פותחת משימות רכש עבור הספקים ישירות מול המחירונים המעודכנים של הגרעין, נטפים ומשתלות נבחרות, וחוסכת עד 12 שעות עבודת תמחור קלקולציות שבועית לאדריכל!
          </p>
        </div>
      </div>

    </div>
  );
};
