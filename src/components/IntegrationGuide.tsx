import React, { useState } from "react";
import { 
  Settings, 
  Copy, 
  Check, 
  Zap, 
  Globe, 
  FileJson, 
  Cpu, 
  Layers, 
  Terminal, 
  ArrowLeftRight, 
  HelpCircle, 
  Sparkles, 
  Play, 
  Database, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";

interface IntegrationGuideProps {
  currentClientName?: string;
  currentGardenSize?: number;
  currentStyle?: string;
}

export const IntegrationGuide: React.FC<IntegrationGuideProps> = ({
  currentClientName = "",
  currentGardenSize = 120,
  currentStyle = "ים-תיכונית כפרית"
}) => {
  const [activeTab, setActiveTab] = useState<"system" | "functions" | "make" | "playground">("system");
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);
  
  // Playground state
  const [sandboxPrompt, setSandboxPrompt] = useState("תייצר גינת פטיו קטנה 30 מ\"ר עם עץ לימון ואדניות לבנדר");
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxOutput, setSandboxOutput] = useState<any>(null);

  const triggerCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(identifier);
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  const systemInstructionsText = `# SYSTEM INSTRUCTIONS FOR LANDSCAPING BUSINESS AUTOMATION SYSTEM

## 1. ROLE & OBJECTIVE
You are the Central AI Architect and Core Engine for a smart landscaping and garden design business. Your primary objective is to streamline the workflow from the moment a lead enters the system until execution. You process raw data, structure it, generate business outputs (quotations/bills of quantities), and write automated design scripts for AutoCAD.

You operate in two main modes based on the user's input:
- MODE 1: Business Automation (Leads, Quotations, Bills of Quantities)
- MODE 2: CAD Design Automation (Generating AutoLISP or Python code for AutoCAD)

---

## 2. OPERATIONAL MODES

### MODE 1: BUSINESS AUTOMATION & STRUCTURED DATA
When receiving raw lead details, customer requests, or project requirements:
1. Extract key parameters: Client Name, Garden Size (sqm), Soil Type, Core Requirements (e.g., grass, specific trees, irrigation system, hardscaping).
2. Format the extracted data into a clean, valid JSON structure.
3. [Placeholder for Price List Integration]: Cross-reference the parameters with the business pricing logic to generate a draft quotation and a preliminary Bill of Quantities (BOQ).

#### Expected Output Format for Mode 1:
Return a JSON object containing:
- client_info (name, contact, location)
- project_specs (garden_size, style, constraints)
- estimated_bill_of_quantities (item, quantity, unit, estimated_cost_multiplier)
- next_action (e.g., "trigger_designer_notification", "create_drive_folder")

---

### MODE 2: AUTOCAD / AUTOLISP GENERATION
When the user requests a design element or gives a natural language instruction for a garden layout (e.g., "Create a planting plan for a 100 sqm garden with 5 olive trees spaced 3 meters apart"):

1. Act as an expert AutoLISP and AutoCAD Python developer.
2. Translate the natural language request into clean, valid, and executable AutoLISP script or Python code compatible with AutoCAD.
3. Adhere to professional drafting standards (layers, precise coordinates, scaling).
4. DO NOT write conversational prose, explanations, or long introductions. Output ONLY the code block.

#### Expected Output Format for Mode 2:
\`\`\`lisp
; [Brief comment explaining what the script does]
(defun c:GenerateGardenLayout ()
  ; AutoLISP code goes here
  (princ)
)
\`\`\`

---

## 3. INTEGRATION & FUNCTION CALLING BLUEPRINT
To bridge this AI model with external systems via API (using tools like Make.com or Zapier), the following logical functions should be supported and triggered when necessary:
- create_crm_lead(client_name, contact_info, garden_size, notes) -> Triggers lead creation in Monday.com / HubSpot.
- generate_quote_pdf(client_json, itemized_costs) -> Triggers document generation and sends a draft to Google Drive.
- output_cad_script(script_content, file_extension) -> Generates a .lsp or .py file for the drafting team.

## 4. TONE & LANGUAGE
Respond in Hebrew or English depending on the input language.
Maintain a highly professional, efficient, and precise technical tone.
Avoid generic pleasantries; focus entirely on delivering structured outputs, accurate formulas, and executable code.`;

  // Standard JSON schemas for Function Calls
  const functionsSchemas = {
    create_crm_lead: `{
  "name": "create_crm_lead",
  "description": "ייצוא ליד חדש למערכת CRM (כמו Monday, HubSpot, או Excel) בעת קליטת לקוח חדש",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "client_name": {
        "type": "STRING",
        "description": "שם מלא של הלקוח הפונה"
      },
      "garden_size": {
        "type": "NUMBER",
        "description": "גודל גינה מוערך במטרים רבועים"
      },
      "contact_info": {
        "type": "STRING",
        "description": "מספר טלפון או אימייל לחזרה"
      },
      "notes": {
        "type": "STRING",
        "description": "דגשים מיוחדים, העדפות עיצוב, או מגבלות תקציביות"
      }
    },
    "required": ["client_name", "garden_size"]
  }
}`,
    generate_quote_pdf: `{
  "name": "generate_quote_pdf",
  "description": "הפקה אוטומטית של מסמך PDF מפורט הכולל הצעת מחיר וכתב כמויות של הגינה המאושרת ושמירתו ב-Google Drive",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "client_name": {
        "type": "STRING",
        "description": "שם הלקוח"
      },
      "total_budget": {
        "type": "NUMBER",
        "description": "תקציב כולל משוער"
      },
      "items": {
        "type": "ARRAY",
        "description": "רשימת סעיפי עבודה וחומרי גלם",
        "items": {
          "type": "OBJECT",
          "properties": {
            "description": { "type": "STRING" },
            "qty": { "type": "NUMBER" },
            "unit": { "type": "STRING" },
            "price": { "type": "NUMBER" }
          }
        }
      }
    },
    "required": ["client_name", "total_budget", "items"]
  }
}`,
    output_cad_script: `{
  "name": "output_cad_script",
  "description": "ייצוא קוד AutoLISP מוגמר ישירות לתיקיית העבודה של המתכנן לצורך טעינה והרצה באוטוקאד",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "script_content": {
        "type": "STRING",
        "description": "קוד AutoLISP תקין שחולל על ידי המודל"
      },
      "file_name": {
        "type": "STRING",
        "description": "שם הקובץ המומלץ, למשל: garden_layout.lsp"
      }
    },
    "required": ["script_content"]
  }
}`
  };

  const runSandboxSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    setSandboxLoading(true);

    setTimeout(() => {
      // Simulate clean structural output matching Model instructions
      const mockResult = {
        "MODE_DETECTED": "MODE 2: CAD Design Automation",
        "estimated_execution_time_ms": 110,
        "function_called_candidate": "output_cad_script",
        "simulated_llm_response": {
          "client_info": {
            "name": currentClientName || "לקוח לא מזוהה",
            "garden_size_sqm": currentGardenSize || 120,
            "style_intent": currentStyle || "כפרית"
          },
          "parsed_components": [
            { "item": "Lemon Tree Entity (שכבת עצים)", "coordinates": "(X: 5.0, Y: 1.5, Z: 0)", "symbol": "CIRCLE (Radius 0.6)" },
            { "item": "Lavender Shrub Group (שכבת שיחים)", "coordinates": "3 units at southwest corner" },
            { "item": "Garden Outer boundary line", "coordinates": "Polyline bounding 30 sqm rectangle" }
          ],
          "generated_lisp_snippet": `; AutoLISP for Lemon Terrace simulated
(defun c:CREATETERRACE ()
  (command "-layer" "m" "L-BOUNDARY" "c" "4" "" "")
  (command "-layer" "m" "L-FRUIT-TREES" "c" "2" "" "")
  (command "rectang" "0,0" "5,6")
  (command "circle" "2.5,3.0" "0.6")
  (alert "סקיצת הטרסה הופקה עבור הלקוח ${currentClientName || 'שלך'} בהצלחה!")
  (princ)
)`
        }
      };
      setSandboxOutput(mockResult);
      setSandboxLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in text-stone-800" dir="rtl" id="integration-guide-workspace">
      
      {/* Visual Header */}
      <div className="bg-gradient-to-l from-emerald-950 via-stone-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-900/30">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <Settings className="w-96 h-96 text-emerald-400" />
        </div>
        
        <div className="relative z-10 max-w-4xl">
          <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold mb-3 border border-emerald-500/35">
            <Zap className="w-3.5 h-3.5" /> מרכז סנכרון ל-Google AI Studio ו-Make.com
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">מדריך הגדרות, העתקת פרומפטים ואינטגרציה</h2>
          <p className="text-stone-300 mt-2 text-sm sm:text-base leading-relaxed">
            כאן תוכל למצוא את המבנה המושלם של ה-**System Instructions** (הנחיות המערכת החדשות), הצהרות ה-**Function Calling** (הפעלת פונקציות), ולקבל מפת דרכים ליישום האוטומציה המלאה מול Make.com וצינור ה-CRM שלך.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === "system"
              ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Terminal className="w-4 h-4" />
          סעיף 1: System Instructions (הוראות מערכת)
        </button>

        <button
          onClick={() => setActiveTab("functions")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === "functions"
              ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <FileJson className="w-4 h-4" />
          סעיף 2: Function Calling (הצהרות API)
        </button>

        <button
          onClick={() => setActiveTab("make")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === "make"
              ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          סעיף 3: ארכיטקטורה ו-Make.com
        </button>

        <button
          onClick={() => setActiveTab("playground")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
            activeTab === "playground"
              ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
          }`}
        >
          <Cpu className="w-4 h-4 animate-pulse" />
          סימולטור משותף ואזורי הרצה
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* TAB 1: SYSTEM INSTRUCTIONS */}
        {activeTab === "system" && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-700" />
                  הוראות מערכת קבועות ל-Google AI Studio
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  העתק את ההוראות המעוצבות מטה והדבק אותן ישירות בתיבת ה-**System Instructions** בצד ימין בסטודיו של גוגל.
                </p>
              </div>

              <button
                onClick={() => triggerCopy(systemInstructionsText, "system_inst")}
                className="self-start sm:self-auto bg-stone-900 hover:bg-stone-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {copiedStatus === "system_inst" ? (
                  <>
                    הקוד הועתק! <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </>
                ) : (
                  <>
                    העתק הכל לקליפבורד <Copy className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            <div className="bg-stone-950 text-stone-100 rounded-2xl p-5 font-mono text-[11px] leading-relaxed max-h-[500px] overflow-y-auto border border-stone-800">
              <pre className="whitespace-pre-wrap text-emerald-400">{systemInstructionsText}</pre>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-800 leading-relaxed">
                <p className="font-bold">כיצד הכלי מבין את כוונת המשתמש?</p>
                <p className="mt-1">
                  ההוראות מגדירות שני מצבי עבודה ברורים: **MODE 1** מנתח לידים ומייצר JSON מובנה, בעוד ש-**MODE 2** עוסק אך ורק בפליטת קוד נקי של AutoLISP או Python ללא שיחות סרק. המתווה מצמצם את סימני הרעש ומאפשר התממשקות ישירה למערכות אוטומציה.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FUNCTION CALLING SCHEMAS */}
        {activeTab === "functions" && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FileJson className="w-5 h-5 text-emerald-700" />
                מבני פונקציות (Function Calling JSON Definitions)
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                כדי לחבר את מודל ה-AI לאפליקציות חיצוניות, נעשה שימוש ב-SDK ובאזור ה-tools ב-AI Studio. המודל יפעיל את הפקודות הללו בצורת מטה-דאטה מובנה.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Function 1 */}
              <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">CRM LEAD</span>
                    <button
                      onClick={() => triggerCopy(functionsSchemas.create_crm_lead, "fn_crm")}
                      className="text-stone-500 hover:text-stone-900 transition-colors"
                      title="העתק סכמה"
                    >
                      {copiedStatus === "fn_crm" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-stone-950 font-mono">1. create_crm_lead</h4>
                  <p className="text-[11px] text-stone-500 mt-1">
                    מייצא את האפיון, הליד ופרטי המשתמש ישירות אל לוחות ה-CRM במשרד (Monday.com או HubSpot).
                  </p>
                </div>
                <div className="bg-slate-900 rounded-xl p-3 font-mono text-[9px] text-cyan-400 overflow-x-auto border border-slate-800 max-h-48 overflow-y-auto">
                  <pre>{functionsSchemas.create_crm_lead}</pre>
                </div>
              </div>

              {/* Function 2 */}
              <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">PDF GENERATOR</span>
                    <button
                      onClick={() => triggerCopy(functionsSchemas.generate_quote_pdf, "fn_pdf")}
                      className="text-stone-500 hover:text-stone-900 transition-colors"
                      title="העתק סכמה"
                    >
                      {copiedStatus === "fn_pdf" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-stone-950 font-mono">2. generate_quote_pdf</h4>
                  <p className="text-[11px] text-stone-500 mt-1">
                    מתרגם את ה-JSON לפירוט טבלאי של שורות הצעת המחיר ומחולל קובץ PDF לתיקיית Google Drive.
                  </p>
                </div>
                <div className="bg-slate-900 rounded-xl p-3 font-mono text-[9px] text-cyan-400 overflow-x-auto border border-slate-800 max-h-48 overflow-y-auto">
                  <pre>{functionsSchemas.generate_quote_pdf}</pre>
                </div>
              </div>

              {/* Function 3 */}
              <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">AUTOCAD CODE</span>
                    <button
                      onClick={() => triggerCopy(functionsSchemas.output_cad_script, "fn_cad")}
                      className="text-stone-500 hover:text-stone-900 transition-colors"
                      title="העתק סכמה"
                    >
                      {copiedStatus === "fn_cad" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <h4 className="text-xs font-bold text-stone-950 font-mono">3. output_cad_script</h4>
                  <p className="text-[11px] text-stone-500 mt-1">
                    מייצר קובץ AutoLISP (.lsp) מוגמר שמיושר לשרטוט, וחוסך למשרד פתיחה ידנית ופרמוט.
                  </p>
                </div>
                <div className="bg-slate-900 rounded-xl p-3 font-mono text-[9px] text-cyan-400 overflow-x-auto border border-slate-800 max-h-48 overflow-y-auto">
                  <pre>{functionsSchemas.output_cad_script}</pre>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: MAKE.COM & ARCHITECTURE */}
        {activeTab === "make" && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-700" />
                מפת זרימת המידע ואינטגרציה מול Make.com
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                כך נראה צינור העבודה המלא מקצה לקצה. השילוב של ממשק ומערכת תרחישים עובד בשיטה הבאה:
              </p>
            </div>

            {/* Step-by-Step Flowchart visualization */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center relative">
                <span className="absolute -top-3 right-4 bg-emerald-600 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center">1</span>
                <div className="font-bold text-xs text-stone-900 mb-1">ממשק משתמש (Softr)</div>
                <p className="text-[11px] text-stone-500">הלקוח או המעצב מזינים פרטים בטופס הדיגיטלי.</p>
              </div>

              <div className="flex items-center justify-center text-stone-400 hidden md:flex">
                <ArrowLeftRight className="w-5 h-5" />
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center relative">
                <span className="absolute -top-3 right-4 bg-emerald-600 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center">2</span>
                <div className="font-bold text-xs text-stone-900 mb-1">טריגר ב-Make.com</div>
                <p className="text-[11px] text-stone-500">שרת האינטגרציה מקבל את פרטי הליד שהוזנו בטופס.</p>
              </div>

              <div className="flex items-center justify-center text-stone-400 hidden md:flex">
                <ArrowLeftRight className="w-5 h-5" />
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center relative">
                <span className="absolute -top-3 right-4 bg-emerald-600 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center">3</span>
                <div className="font-bold text-xs text-emerald-950 mb-1">פנייה ל-Gemini API</div>
                <p className="text-[11px] text-emerald-800">הפעלה של המודל שיושב ב-Google AI Studio לעיבוד הנתונים.</p>
              </div>

              <div className="flex items-center justify-center text-stone-400 hidden md:flex">
                <ArrowLeftRight className="w-5 h-5" />
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-center relative">
                <span className="absolute -top-3 right-4 bg-emerald-600 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center">4</span>
                <div className="font-bold text-xs text-stone-900 mb-1">פירוש פלט והפעלת API</div>
                <p className="text-[11px] text-stone-500">חילוץ מערכי ה-CRM ויצירת הצעת מחיר וכתב כמויות משוערת.</p>
              </div>

              <div className="flex items-center justify-center text-stone-400 hidden md:flex">
                <ArrowLeftRight className="w-5 h-5" />
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center text-white relative">
                <span className="absolute -top-3 right-4 bg-emerald-600 text-white font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center">5</span>
                <div className="font-bold text-xs text-cyan-300 mb-1">הרצת קוד AutoCAD</div>
                <p className="text-[11px] text-stone-400">אוטוליספ מוכן נטען לעמדת השרטוט ומשרטט את הגינה.</p>
              </div>

            </div>

            {/* Code blueprint example for Make HTTP Module */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-900">דוגמה לקריאת ה-HTTP שמומלץ להגדיר בצומת ה-Make.com שלך:</h4>
              <div className="bg-stone-950 text-stone-100 rounded-2xl p-5 font-mono text-[10px] leading-relaxed border border-stone-800">
                <div className="text-stone-500 mb-2"># HTTP POST Request definition</div>
                <div><span className="text-purple-400">URL:</span> https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=<span className="text-emerald-400">YOUR_GEMINI_API_KEY</span></div>
                <div><span className="text-purple-400">METHOD:</span> POST</div>
                <div className="mt-2"><span className="text-purple-400">Headers:</span> {`{ "Content-Type": "application/json" }`}</div>
                <div className="mt-2"><span className="text-purple-400">Body Payload:</span></div>
                <pre className="text-cyan-400 overflow-x-auto whitespace-pre">{`{
  "systemInstruction": {
    "parts": [{ "text": "You are the Central AI Architect... [the code from Tab 1]" }]
  },
  "contents": [{
    "parts": [{ "text": "לקוח חדש: ${currentClientName || 'יוסי כהן'}, גינה בגודל ${currentGardenSize || 100} מ''ר, סגנון ${currentStyle || 'מודרני'}" }]
  }]
}`}</pre>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: INTERACTIVE PLAYGROUND SIMULATOR */}
        {activeTab === "playground" && (
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-700" />
                סימולטור בדיקת משורטט AI Studio (Playground Simulator)
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                מערכת סימולציה הבודקת כיצד מנוע ה-AI יסווג את הנתונים, ינתב את ה-Function Calling שלכם וישלוף את הנתונים לשילוב ב-CRM או להדפסה ב-CAD.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Form Input */}
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 space-y-4">
                <h4 className="text-xs font-bold text-stone-900">הזן בקשת בדיקה לדוגמה:</h4>
                
                <form onSubmit={runSandboxSimulate} className="space-y-4">
                  <textarea
                    rows={4}
                    value={sandboxPrompt}
                    onChange={(e) => setSandboxPrompt(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 p-3 text-xs text-stone-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                    placeholder="כתוב בקשת אפיון או שרטוט..."
                  />

                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-stone-200">
                    <div>
                      <span className="text-[10px] text-stone-500 block">סיווג מיועד:</span>
                      <span className="text-[11px] font-bold text-emerald-700">Mode Detectors On</span>
                    </div>
                    <button
                      type="submit"
                      disabled={sandboxLoading}
                      className="bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs px-4 py-2.5 rounded-xl text-center flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {sandboxLoading ? (
                        <>מעבד סימולציה...</>
                      ) : (
                        <>
                          בצע בדיקת הרצה <Play className="w-3.5 h-3.5 text-emerald-300" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-600 leading-relaxed border border-stone-200">
                  <span className="font-bold text-stone-800">הערת מנוע:</span> סימולציה זו מדמה שליחה מדוייקת של הצעת הערך אל השרת והגדרת ה-JSON. הבדיקות עוזרות לדייק את המלל לפני ההזנה בסטודיו של Google.
                </div>
              </div>

              {/* Console/JSON Output simulated */}
              <div className="bg-stone-950 text-stone-100 rounded-2xl p-5 font-mono text-[11px] border border-stone-800 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-850 progress-bar">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Terminal className="w-4 h-4" /> פלט משוער מ-Google AI API
                    </span>
                    <span className="text-[10px] text-stone-500">SIMULATOR OUTPUT</span>
                  </div>

                  <div className="py-4 space-y-4 max-h-[290px] overflow-y-auto">
                    {sandboxLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                        <span className="text-stone-400 text-xs">Gemini Studio Token Parsing...</span>
                      </div>
                    ) : sandboxOutput ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-stone-500">Detected Trigger Mode:</span>{" "}
                          <span className="text-emerald-400 font-bold">{sandboxOutput.MODE_DETECTED}</span>
                        </div>
                        <div>
                          <span className="text-stone-500">Target Function:</span>{" "}
                          <span className="text-cyan-400 font-bold">{sandboxOutput.function_called_candidate}()</span>
                        </div>
                        <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 text-stone-300 text-[10px] space-y-1">
                          <div className="text-yellow-400 font-semibold mb-1">simulated_llm_response output:</div>
                          <pre className="text-stone-300 overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(sandboxOutput.simulated_llm_response, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-stone-500 text-xs font-sans">
                        לחץ על &quot;בצע בדיקת הרצה&quot; משמאל כדי לראות את התרגום המבני של ההנחיה
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-850 flex items-center justify-between text-[10px] text-stone-500">
                  <span>API KEY CONFIG: DETECTED_ENV</span>
                  <span className="text-emerald-400 font-bold">READY TO DEPLOY</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      
    </div>
  );
};
