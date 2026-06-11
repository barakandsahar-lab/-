import React, { useState } from "react";
import { Header } from "./components/Header";
import { LeadIntake } from "./components/LeadIntake";
import { QuoteBreakdown } from "./components/QuoteBreakdown";
import { BillOfQuantities } from "./components/BillOfQuantities";
import { ClientPortalMock } from "./components/ClientPortalMock";
import { AutoCadAgent } from "./components/AutoCadAgent";
import { IntegrationGuide } from "./components/IntegrationGuide";
import { AnalysisResponse } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Trees, CheckCircle, Compass, FileText, ClipboardList } from "lucide-react";

export default function App() {
  const [currentStep, setStep] = useState(1);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalysisComplete = (data: AnalysisResponse) => {
    setAnalysisData(data);
    setIsApproved(false); // Reset approval status for a new lead
    setStep(2); // Automatically advance to the Costing & BoQ step
  };

  const handleUpdateData = (updatedData: AnalysisResponse) => {
    setAnalysisData(updatedData);
  };

  // Helper info about what phase is currently active
  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <LeadIntake
          onAnalysisComplete={handleAnalysisComplete}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      );
    }

    if (currentStep === 5) {
      return (
        <IntegrationGuide
          currentClientName={analysisData?.clientName}
          currentGardenSize={analysisData?.gardenSizeSqm}
          currentStyle={analysisData?.styleDescription}
        />
      );
    }

    if (!analysisData) {
      return (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200" dir="rtl">
          <p className="text-stone-500 font-medium">טרם הוזנו נתוני פנייה לניתוח. אנא חזור לשלב הראשון.</p>
          <div className="flex gap-3 justify-center mt-4">
            <button
              onClick={() => setStep(1)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              חזור לשלב 1 (קליטת פנייה)
            </button>
            <button
              onClick={() => setStep(5)}
              className="bg-stone-800 hover:bg-stone-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              צפה במדריך הגדרות AI
            </button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 2:
        return (
          <div className="space-y-12">
            <QuoteBreakdown
              data={analysisData}
              onUpdateData={handleUpdateData}
              onNextStep={() => setStep(3)}
            />
            <div className="border-t border-stone-200/60 pt-10">
              <BillOfQuantities
                data={analysisData}
                onUpdateData={handleUpdateData}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <ClientPortalMock
            data={analysisData}
            onApprovalStatusChange={setIsApproved}
            isApproved={isApproved}
          />
        );
      case 4:
        return (
          <AutoCadAgent
            initialPrompt={analysisData?.styleDescription ? `תייצר סקיצת AutoCAD המפרטת פריסת גינה מעוצבת בסגנון ${analysisData.styleDescription} בגודל של ${analysisData.gardenSizeSqm} מ"ר עם ציר פריסת השתילה של העצים` : undefined}
            gardenSizeSqm={analysisData?.gardenSizeSqm}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* Top Header & Steps Navigation bar */}
      <Header
        currentStep={currentStep}
        setStep={setStep}
        hasData={!!analysisData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer bar */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-500 py-6 text-center text-xs ml-auto mr-auto w-full max-w-7xl px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-3" dir="rtl">
        <div>
          <span>מערכת אוטומציה אדריכלית מבית </span>
          <span className="font-bold text-stone-300">Landscape Automation Studio</span>
          <span> • 2026</span>
        </div>
        <div className="flex gap-4 text-[11px]">
          <button onClick={() => setStep(1)} className="hover:text-stone-300 transition-colors cursor-pointer">קליטת פנייה</button>
          <span className="text-stone-700">|</span>
          <button 
            disabled={!analysisData} 
            onClick={() => setStep(2)} 
            className={`hover:text-stone-300 transition-colors ${!analysisData ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            הצעת מחיר וכתב כמויות
          </button>
          <span className="text-stone-700">|</span>
          <button 
            disabled={!analysisData} 
            onClick={() => setStep(3)} 
            className={`hover:text-stone-300 transition-colors ${!analysisData ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            אישור חתימה
          </button>
          <span className="text-stone-700">|</span>
          <button onClick={() => setStep(4)} className="hover:text-stone-300 transition-colors cursor-pointer">סוכן AutoCAD</button>
          <span className="text-stone-700">|</span>
          <button onClick={() => setStep(5)} className="hover:text-stone-300 transition-colors cursor-pointer">הגדרות ואינטגרציות AI</button>
        </div>
      </footer>

    </div>
  );
}
