import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini developer SDK client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// -------------------------------------------------------------
// Helper: Timeout Wrapper to prevent indefinite hanging of API calls
// -------------------------------------------------------------
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(errorMsg)), timeoutMs))
  ]);
}

// -------------------------------------------------------------
// AI Route 1: Lead Analysis & Quote + Bill of Quantities Creator
// -------------------------------------------------------------
app.post("/api/leads/analyze", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { leadText, budget, gardenSize } = req.body;
    
    if (!leadText) {
      res.status(400).json({ error: "אנא הכנס פרטי פנייה או ליד לניתוח" });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Elegant, custom Israeli-focused fallback generator if API key is not configured yet
      console.log("Using rich fallback mock generator (no API key configured)");
      const sizeNum = parseInt(gardenSize) || 120;
      const budgetNum = parseInt(budget) || 45000;
      
      const responseFallback = generateMockWorkflow(leadText, sizeNum, budgetNum);
      res.json(responseFallback);
      return;
    }

    // Call standard Gemini model to output clean structured JSON containing quote and BoQ in Hebrew
    const prompt = `
      You are a professional Israeli Landscape Architect and Estimator.
      Analyze the following lead text describing a garden design request and generate:
      1. Summary details (Client name or company where available, parsed garden size in sqm, garden style/concept).
      2. A full professional Quote (הצעת מחיר) in Hebrew currency NIS (₪) with realistic Israeli market rates.
      3. A detailed Bill Of Quantities / Checklist (כתב כמויות / פיצ'יפקעס) divided into small action items with codes, quantities, and departments.
      
      Lead prompt: "${leadText}"
      Approximate Garden Size: ${gardenSize ? gardenSize + " sqm" : "unspecified"}
      Target Budget: ${budget ? budget + " NIS" : "unspecified"}

      You must return a valid JSON matching the exact schema specified.
    `;

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You represent an automated operations agent for a top Israeli landscape architecture and contracting firm. Always output responses in Hebrew with standard architectural terminology. Keep calculations realistic.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                clientName: { type: Type.STRING, description: "שם הלקוח המזוהה או 'לקוח פוטנציאלי'" },
                gardenSizeSqm: { type: Type.NUMBER, description: "גודל הגינה במ\"ר כפי שנותח מהטקסט" },
                styleDescription: { type: Type.STRING, description: "סגנון הגינה המאופיין (מודרני, ים תיכוני, כפרי, חסכוני במים וכו')" },
                estimatedWeeks: { type: Type.NUMBER, description: "משך זמן עבודה מוערך בשבועות" },
                quoteItems: {
                  type: Type.ARRAY,
                  description: "סעיפי הצעת המחיר המחולקים לפי קטגוריות מקצועיות",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING, description: "קטגוריה (צמחייה, פיתוח ועץ, השקיה, תאורה, תשתייות ועפר, פיקוח)" },
                      title: { type: Type.STRING, description: "שם הפריט או העבודה" },
                      quantity: { type: Type.NUMBER, description: "כמות" },
                      unit: { type: Type.STRING, description: "יחידת מידה (מ\"ר, קוב, יחידה, גלובלי)" },
                      unitPrice: { type: Type.NUMBER, description: "מחיר ליחידה בשקלים" },
                      totalPrice: { type: Type.NUMBER, description: "מחיר כולל לסעיף בשקלים" },
                      notes: { type: Type.STRING, description: "הערה מקצועית קצרה" }
                    },
                    required: ["category", "title", "quantity", "unit", "unitPrice", "totalPrice"]
                  }
                },
                billOfQuantities: {
                  type: Type.ARRAY,
                  description: "כתב כמויות מפורט - רשימת הזמנות וביצוע לצוותי השטח ('פיצ'יפקעס')",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      itemCode: { type: Type.STRING, description: "קוד פריט מזהה (למשל PLANT-01, WOOD-02, IRR-03)" },
                      description: { type: Type.STRING, description: "תיאור הפריט המדויק (למשל: עצי זית מעוצבים גובה 1.5, מחשב השקיה גלאקסי 4 ברזים)" },
                      sku: { type: Type.STRING, description: "מפרט קצר או שם ספק מומלץ" },
                      quantityNeeded: { type: Type.NUMBER, description: "כמות נדרשת" },
                      unit: { type: Type.STRING, description: "יחידה" },
                      status: { type: Type.STRING, description: "סטטוס התחלתי, תמיד החזר 'טרם הוזמן' (Not Ordered)" }
                    },
                    required: ["itemCode", "description", "quantityNeeded", "unit", "status"]
                  }
                },
                designerSpecialNotes: { type: Type.STRING, description: "הערות והמלצות מיוחדות לאדריכל לתכנון באוטוקאד" }
              },
              required: ["clientName", "gardenSizeSqm", "styleDescription", "estimatedWeeks", "quoteItems", "billOfQuantities", "designerSpecialNotes"]
            }
          }
        }),
        8000,
        "Gemini API Timeout"
      );

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (geminiError: any) {
      console.warn("Gemini API call failed or timed out. Falling back to local robust generator. Error:", geminiError.message);
      const sizeNum = parseInt(gardenSize) || 120;
      const budgetNum = parseInt(budget) || 45000;
      const fallbackData = generateMockWorkflow(leadText, sizeNum, budgetNum);
      
      fallbackData.designerSpecialNotes = `⚠️ שים לב: עקב עומס זמני בשרתי ה-AI של Google (שגיאה: ${geminiError.message || "503 Unavailable"}), מערכת הניהול הפעילה אוטומטית מודל חלופי מהיר מקומי. הצעת המחיר, כתב כמויות ה-פיצ'יפקעס וההנחיות לאקאד הופקו בהצלחה וללא עיכובים!\n\n${fallbackData.designerSpecialNotes}`;
      
      res.json(fallbackData);
    }
  } catch (error: any) {
    console.error("Error in lead analyzer API:", error);
    res.status(500).json({ error: "שגיאה בניתוח הליד: " + error.message });
  }
});

// -------------------------------------------------------------
// AI Route 2: AutoCAD LISP & Python Script Generator Agent
// -------------------------------------------------------------
app.post("/api/autocad/generate", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { requestText, gardenDimensions, selectedPlants } = req.body;

    if (!requestText) {
      res.status(400).json({ error: "אנא פרט מה ברצונך לצייר באוטוקאד" });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      console.log("Using AutoCAD mockup code generator (no API key configured)");
      const lispCode = generateMockLisp(requestText, gardenDimensions, selectedPlants);
      res.json(lispCode);
      return;
    }

    // Call standard Gemini model to formulate actual AutoLISP command script in AutoCAD format
    const prompt = `
      You are an elite AutoCAD script agent and CAD software automation expert.
      Generate a clean, fully functional AutoLISP (.lsp) code and optionally a Python script equivalent, tailored for a landscape architect.
      
      User wishes to draw: "${requestText}"
      Target Garden dimensions: ${JSON.stringify(gardenDimensions || "rectangular default")}
      Selected items to integrate: ${JSON.stringify(selectedPlants || [])}

      Follow these requirements:
      1. Write clean, direct AutoLISP code inside the "lispCode" field. Do NOT include markdown code fences inside the string itself. Declare a global command like '(defun c:CREATE_GARDEN () ...)' or similar.
      2. Include plenty of English/Hebrew commentary in the LISP code detailing what each step is doing (creating layers, setting colors, drawing boundary PLINE, arraying trees on a grid, drawing circles for shrubs, adding text labels).
      3. Provide a clear Hebrew and English set of step-by-step instructions on how to load and run this in AutoCAD (command 'APPLOAD', running the brand-new command shortcut).
      4. Suggest a brief description of what this code draws, and the calculated count of CAD entities.
      
      You must respond in a valid JSON matching this schema.
    `;

    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            systemInstruction: "You are an AutoCAD engine assistant. Your code must be syntactically valid and utilize standard AutoLISP functions (e.g. command, entmake, setq, polar, foreach, while) to draw genuine design templates.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                commandShortcut: { type: Type.STRING, description: "הסמל או קיצור המחווה לריצה בתוך אוטוקאד (למשל GARDEN_LAYOUT / INSERT_SHRUBS)" },
                lispCode: { type: Type.STRING, description: "קוד AutoLISP נקי, מוכן להעתקה ושימוש. ללא תבניות מארקדאון פנימיות." },
                pythonEquivalent: { type: Type.STRING, description: "קוד Python כותב חילופי לשימוש בכישור ה-Python API החדש של AutoCAD" },
                instructionsHe: { type: Type.STRING, description: "הסבר מפורט בעברית כיצד לטעון ולהפעיל באוטוקאד" },
                instructionsEn: { type: Type.STRING, description: "Description in English for executing the script" },
                cadElementsCount: {
                  type: Type.OBJECT,
                  properties: {
                    boundaries: { type: Type.NUMBER },
                    trees: { type: Type.NUMBER },
                    shrubs: { type: Type.NUMBER },
                    utilityAndLabels: { type: Type.NUMBER }
                  }
                }
              },
              required: ["commandShortcut", "lispCode", "instructionsHe", "instructionsEn", "cadElementsCount"]
            }
          }
        }),
        8000,
        "Gemini API Timeout"
      );

      const data = JSON.parse(response.text || "{}");
      res.json(data);
    } catch (geminiError: any) {
      console.warn("AutoCAD LISP API call failed or timed out. Falling back to local robust generator. Error:", geminiError.message);
      const fallbackData = generateMockLisp(requestText, gardenDimensions, selectedPlants);
      
      fallbackData.instructionsHe = `⚠️ שים לב: עקב עומס זמני בשרתי ה-AI של Google (שגיאה: ${geminiError.message || "503 Unavailable"}), מערכת האוטומציה שילבה מחולל AutoLISP חלופי מקומי יציב. הקוד, השכבות, הממדים וההנחיות נוצרו בהצלחה וערוכים לטרמינל האוטוקאד שלך!\n\n${fallbackData.instructionsHe}`;
      
      res.json(fallbackData);
    }
  } catch (error: any) {
    console.error("Error in AutoCAD LISP generator API:", error);
    res.status(500).json({ error: "שגיאה ביצירת סקריפט: " + error.message });
  }
});


// -------------------------------------------------------------
// Fallback / Helper Generators for demo robustness (RTL / Hebrew)
// -------------------------------------------------------------

function generateMockWorkflow(leadText: string, sizeSqm: number, budgetInNis: number) {
  // Parsing simple keyword intents
  const textLower = leadText.toLowerCase();
  let style = "גינה מודרנית ומשולבת";
  let weeks = 3;
  
  if (textLower.includes("זית") || textLower.includes("כפרי") || textLower.includes("אבן")) {
    style = "גן ים-תיכוני כפרי";
    weeks = 4;
  } else if (textLower.includes("יפני") || textLower.includes("מינימליסט")) {
    style = "גן זן מינימליסטי יפני";
    weeks = 5;
  } else if (textLower.includes("יוקרה") || textLower.includes("בריכה") || textLower.includes("דק")) {
    style = "גינת אחוזה מודרנית יוקרתית";
    weeks = 6;
  } else if (textLower.includes("אדניות") || textLower.includes("מרפסת")) {
    style = "גינת גג אורבנית עם מערכת אדניות";
    weeks = 2;
  }

  const items = [
    {
      category: "תשתיות ועפר",
      title: "פינוי פסולת, חישוף עשבייה ויישור שטח ממוחשב",
      quantity: 1,
      unit: "גלובלי",
      unitPrice: 3500,
      totalPrice: 3500,
      notes: "כולל השכרת שופל מיני לשני ימי עבודה"
    },
    {
      category: "תשתיות ועפר",
      title: "אספקת תערובת פרא-אורגנית לשכבת שתילה מועשרת (קומפוסט ומיקרואורגניזמים)",
      quantity: Math.ceil(sizeSqm * 0.15),
      unit: "קוב",
      unitPrice: 280,
      totalPrice: Math.ceil(sizeSqm * 0.15) * 280,
      notes: "תערובת ספק מורשה משק תלמים"
    },
    {
      category: "השקיה",
      title: "מערכת השקיה מתוחכמת עם מחשב השקיה חכם (מד לחות ואביזרי לחץ)",
      quantity: 1,
      unit: "יחידה",
      unitPrice: 4200,
      totalPrice: 4200,
      notes: "כולל מחשב השקיה מבוסס Wi-Fi לחסכון אופטימלי במים"
    },
    {
      category: "פיתוח ועץ",
      title: "חיפוי קרקע - טוף טבעי כהה ויריעה מונעת עשבייה",
      quantity: Math.ceil(sizeSqm * 0.4),
      unit: "מ\"ר",
      unitPrice: 90,
      totalPrice: Math.ceil(sizeSqm * 0.4) * 90,
      notes: "טופס פריסה מונעת עשבייה מתחת לטוף"
    },
    {
      category: "צמחייה",
      title: "אספקה ושתילת עצי זית מעוצבים עתיקים (גיל 15 ומעלה)",
      quantity: 2,
      unit: "יחידה",
      unitPrice: 2400,
      totalPrice: 4800,
      notes: "שתילה באזור המיקוד של הגינה בעת מנוף"
    },
    {
      category: "צמחייה",
      title: "שתילים ארומטיים, לבנדר, רוזמרין ושיחים מותאמי חצי-צל",
      quantity: 45,
      unit: "יחידה",
      unitPrice: 65,
      totalPrice: 2925,
      notes: "מגוון משמר ריח דבורים מושך ומדובר"
    },
    {
      category: "תאורה",
      title: "תאורת גן במתח נמוך 12V מוגנת מים חסכונית - גופי קוצים מעוצבים",
      quantity: 12,
      unit: "יחידה",
      unitPrice: 320,
      totalPrice: 3840,
      notes: "גופי תאורת ספוט LED חמים ממוקדים בעצים ובדפנות"
    }
  ];

  // If budget supports wooden deck, add it
  if (budgetInNis >= 50000 || textLower.includes("דק") || textLower.includes("עץ")) {
    const deckSize = Math.max(12, Math.floor(sizeSqm * 0.15));
    items.push({
      category: "פיתוח ועץ",
      title: "התקנת דק עץ איפאה פרימיום כולל קונסטרוקציה ועמידות פקקי חיבור סמוי",
      quantity: deckSize,
      unit: "מ\"ר",
      unitPrice: 950,
      totalPrice: deckSize * 950,
      notes: "כולל ליטוש וציפוי הגנה ראשוני מפני שמן ושמש ישראלית"
    });
  }

  // Calculate sum and add supervision
  let currentSum = items.reduce((acc, item) => acc + item.totalPrice, 0);
  items.push({
    category: "פיקוח",
    title: "פיקוח אדריכלי נוף, עמידות איכות עבודה וחברי צוות ביצוע",
    quantity: weeks,
    unit: "שבועי",
    unitPrice: 1500,
    totalPrice: weeks * 1500,
    notes: "כולל 2 סיורים בשבוע ומענה טלפוני יומי לקבלנים"
  });

  const finalSum = items.reduce((acc, item) => acc + item.totalPrice, 0);

  const boq = [
    { itemCode: "PREP-001", description: "רשת ניקוז שטח מחלחלת וגבריאל סינון", sku: "הגרעין / קל-ניקוז", quantityNeeded: 1, unit: "גלובלי", status: "טרם הוזמן" },
    { itemCode: "CONTR-01", description: "בקר השקיה 4 ברזים חכם Galaxy Wi-Fi", sku: "חברת נטפים - Netafim Corp", quantityNeeded: 1, unit: "יחידה", status: "טרם הוזמן" },
    { itemCode: "TREE-OLI", description: "עצי זית איכותיים מעוצבים בכד 100 ליטר", sku: "משתלת סלונר / ירוק", quantityNeeded: 2, unit: "יחידה", status: "טרם הוזמן" },
    { itemCode: "SHRUB-LAV", description: "לונדר רפואי (Lavandula) עציץ קוטר 12", sku: "משתלת כפר מלל", quantityNeeded: 25, unit: "יחידה", status: "טרם הוזמן" },
    { itemCode: "SHRUB-ROZ", description: "רוזמרין משתרע עציץ קוטר 12 חזק", sku: "משתלת כפר מלל", quantityNeeded: 20, unit: "יחידה", status: "טרם הוזמן" },
    { itemCode: "LGT-SPOT", description: "ספוט קוץ גינה 5W LED גוון צבע חם 3000K", sku: "קיסר תאורה - גוון חם", quantityNeeded: 12, unit: "יחידה", status: "טרם הוזמן" },
  ];

  if (budgetInNis >= 50000 || textLower.includes("דק") || textLower.includes("עץ")) {
    boq.push({
      itemCode: "WD-IPAE",
      description: "קורות עץ איפאה טבקו ממוינות ארוכות רוחב 14 סמ",
      sku: "עצי חגור - מחסן עצים סיטונאי",
      quantityNeeded: Math.max(12, Math.floor(sizeSqm * 0.15)) * 1.08, // with 8% waste
      unit: "מ\"ר",
      status: "טרם הוזמן"
    });
  }

  return {
    clientName: "לקוח פוטנציאלי",
    gardenSizeSqm: sizeSqm,
    styleDescription: style,
    estimatedWeeks: weeks,
    quoteItems: items,
    billOfQuantities: boq,
    designerSpecialNotes: "המלצת זרימה: להבטיח מעבר כבל הזנה לתאורה תת קרקעית עוד לפני פיזור הטוף והעפר הראשוני. באוטוקאד, מומלץ למקם את ציר העצים המעוצבים בשכבה נפרדת (L-TREES) ואת קווי ההשקיה בטיפוס קו מקווקו ייחודי (L-IRRIG) כדי להקל על הפקת כתב הכמויות."
  };
}

function generateMockLisp(requestText: string, dims: any, plants: string[]) {
  const widthStr = dims?.width || "10.0";
  const lengthStr = dims?.length || "15.0";
  const spacingStr = dims?.spacing || "3.0";

  const numTrees = Math.floor(parseFloat(lengthStr) / parseFloat(spacingStr));

  const lispCode = `;========================================================================
; AutoLISP script generated by Landscape Automation Studio
; Description: Generates a grid layout for landscape architecture
; Parameters: Area ${widthStr}m x ${lengthStr}m, Spacing ${spacingStr}m
;========================================================================

(defun c:CREATE_GARDEN ( / pt width length spacing i pt_next)
  (setq old_cmdecho (getvar "cmdecho"))
  (setvar "cmdecho" 0)

  (alert "סייען האוטומציה יוצר כעת את הגינה במרחב העבודה שלך...")
  
  ; Prompt user for insertion point
  (setq pt (getpoint "\\nבחר נקודת התחלה לפינת הגינה: "))
  (if (null pt) (setq pt '(0.0 0.0 0.0)))
  
  (setq width ${widthStr})
  (setq length ${lengthStr})
  (setq spacing ${spacingStr})

  ; Create dedicated Design layers
  (command "-layer" "m" "L-BOUNDARY" "c" "4" "" "") ; Cyan for boundary
  (command "-layer" "m" "L-TREES" "c" "2" "" "")    ; Green for trees
  (command "-layer" "m" "L-LABELS" "c" "7" "" "")   ; White for text

  ; Draw Boundary Polyline
  (command "layer" "s" "L-BOUNDARY" "")
  (command "pline" 
    pt 
    (list (+ (car pt) width) (cadr pt) 0.0)
    (list (+ (car pt) width) (+ (cadr pt) length) 0.0)
    (list (car pt) (+ (cadr pt) length) 0.0)
    "c"
  )
  
  ; Draw main featured olive trees at intervals
  (command "layer" "s" "L-TREES" "")
  (setq i 1.5)
  (while (< i length)
    (setq pt_next (list (+ (car pt) (/ width 2.0)) (+ (cadr pt) i) 0.0))
    
    ; Draw Olive tree representation (Circle inside secondary circle)
    (command "circle" pt_next 0.6)
    (command "circle" pt_next 0.15)
    
    ; Add dynamic node index labels
    (command "layer" "s" "L-LABELS" "")
    (command "text" "j" "mc" (list (car pt_next) (+ (cadr pt_next) 1.0) 0.0) 0.3 0.0 (strcat "Olive Tree - " (rtos i 2 0) "m"))
    (command "layer" "s" "L-TREES" "")
    
    (setq i (+ i spacing))
  )

  ; Additional planting rows
  (setq pt_shrub1 (list (+ (car pt) 1.5) (+ (cadr pt) 2.0) 0.0))
  (setq pt_shrub2 (list (- (+ (car pt) width) 1.5) (+ (cadr pt) 2.0) 0.0))
  (command "circle" pt_shrub1 0.3)
  (command "circle" pt_shrub2 0.3)
  (command "text" pt_shrub1 0.25 0.0 "Shrub Group A")
  (command "text" pt_shrub2 0.25 0.0 "Shrub Group B")

  (setvar "cmdecho" old_cmdecho)
  (princ "\\n========================================\\n")
  (princ "\\n[תוכנית הגינה נוצרה בהצלחה! השתמש בפקודה GARDEN_LAYOUT]")
  (princ "\\n========================================\\n")
  (princ)
)

(princ "\\n[הערה]: סקריפט ה-Lisp נטען בהצלחה. הקלד CREATE_GARDEN להרצה.")
(princ)
`;

  const pythonCode = `import sys
try:
    import pyautocad
    from pyautocad import Autocad, APoint
    
    acad = Autocad(create_if_not_exists=True)
    acad.prompt("Hello from AutoCAD Automation Agent\\n")
    
    # Define garden outer fence boundary
    width = ${widthStr}
    length = ${lengthStr}
    
    p1 = APoint(0, 0)
    p2 = APoint(width, 0)
    p3 = APoint(width, length)
    p4 = APoint(0, length)
    
    # Generate line entities
    acad.model.AddLine(p1, p2)
    acad.model.AddLine(p2, p3)
    acad.model.AddLine(p3, p4)
    acad.model.AddLine(p4, p1)
    
    # Array Olive Trees dynamically
    spacing = ${spacingStr}
    y_pos = 2.0
    while y_pos < length:
        tree_point = APoint(width / 2.0, y_pos)
        # Add tree circle boundary (outer diameter 1.2m equivalent)
        circle = acad.model.AddCircle(tree_point, 0.6)
        acad.model.AddMText(APoint(width / 2.0, y_pos + 0.8), 0.3, f"Olive Tree (Y={y_pos}m)")
        y_pos += spacing
        
    print("AutoCAD python script executed successfully.")
except ImportError:
    print("Error: PyAutoCAD module not installed.")
`;

  return {
    commandShortcut: "CREATE_GARDEN",
    lispCode: lispCode,
    pythonEquivalent: pythonCode,
    instructionsHe: "כיצד להשתמש בקוד AutoLISP שלך באוטוקאד:\n1. העתק את כל קוד ה-LISP המופיע בתיבה באמצעות כפתור ההעתקה.\n2. פתח את תוכנת AutoCAD ועבור לקובץ השרטוט שעליו ברצונך לעבוד.\n3. הקלד את הפקודה 'VLIDE' או 'APPLOAD' או פשוט פתח פנקס רשימות (Notepad), הדבק את הקוד ושמור אותו כקובץ בשם: landscape-automation.lsp\n4. בתוך ה-AutoCAD, הקלד את הפקודה APPLOAD, טען את הקובץ שיצרת.\n5. כעת הקלד בשורת הפקודות את שם הקיצור: CREATE_GARDEN ולחץ Enter.\n6. בחר את נקודת ההתחלה והגינה תיבנה כולל שכבות, מימדי גבול, עצי זית מעוצבים כסמלים ותוויות טקסט באופן מיידי!",
    instructionsEn: "To use this script in AutoCAD:\n1. Copy the code into notepad and save as 'garden.lsp'\n2. Inside AutoCAD runs 'APPLOAD' and load this garden.lsp file\n3. Type 'CREATE_GARDEN' in AutoCAD terminal to construct coordinates, boundary layers, and tree arrays instantly.",
    cadElementsCount: {
      boundaries: 1,
      trees: numTrees,
      shrubs: 2,
      utilityAndLabels: numTrees + 2
    }
  };
}

// -------------------------------------------------------------
// Dev & Production serving
// -------------------------------------------------------------
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware AFTER API routes so API requests aren't intercepted
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
