export interface QuoteItem {
  category: string;
  title: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface BillOfQuantitiesItem {
  itemCode: string;
  description: string;
  sku: string;
  quantityNeeded: number;
  unit: string;
  status: string; // 'טרם הוזמן' | 'הוזמן' | 'סופק' | 'בשטח'
}

export interface AnalysisResponse {
  clientName: string;
  gardenSizeSqm: number;
  styleDescription: string;
  estimatedWeeks: number;
  quoteItems: QuoteItem[];
  billOfQuantities: BillOfQuantitiesItem[];
  designerSpecialNotes: string;
}

export interface CADResponse {
  commandShortcut: string;
  lispCode: string;
  pythonEquivalent?: string;
  instructionsHe: string;
  instructionsEn: string;
  cadElementsCount: {
    boundaries: number;
    trees: number;
    shrubs: number;
    utilityAndLabels: number;
  };
}

export interface LayoutDimensions {
  width: number;
  length: number;
  spacing: number;
}
