import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CameraScanner } from './components/CameraScanner';
import { ScanResultCard } from './components/ScanResultCard';
import { ReceiptView } from './components/ReceiptView';
import { HistoryView } from './components/HistoryView';
import { RepoExplorer } from './components/RepoExplorer';
import { ScanResponse } from './types';
import { Sparkles, ShieldCheck, Database, Camera, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'receipt' | 'history' | 'repo'>('scanner');
  const [receiptItems, setReceiptItems] = useState<ScanResponse[]>([]);
  const [currentScanResult, setCurrentScanResult] = useState<ScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [totalScanCount, setTotalScanCount] = useState(0);

  // Load initial scans count from API
  useEffect(() => {
    fetch('/api/scans')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTotalScanCount(data.length);
        }
      })
      .catch(() => {});
  }, []);

  const handleScanComplete = (result: ScanResponse) => {
    setCurrentScanResult(result);
    setTotalScanCount((prev) => prev + 1);
  };

  const handleAddToReceipt = (scan: ScanResponse) => {
    setReceiptItems((prev) => [...prev, scan]);
  };

  const handleRemoveFromReceipt = (index: number) => {
    setReceiptItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearReceipt = () => {
    setReceiptItems([]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-[#e0e0e0] flex flex-col selection:bg-[#c5a059] selection:text-black">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        receiptCount={receiptItems.length}
        totalScanCount={totalScanCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Tab 1: Scanner Terminal */}
        {activeTab === 'scanner' && (
          <div className="space-y-8">
            <CameraScanner
              onScanComplete={handleScanComplete}
              isScanning={isScanning}
              setIsScanning={setIsScanning}
            />

            {currentScanResult && (
              <div id="scan-result-anchor" className="scroll-mt-20">
                <ScanResultCard
                  scanResult={currentScanResult}
                  onAddToReceipt={handleAddToReceipt}
                  isAddedToReceipt={receiptItems.some((r) => r.scan.id === currentScanResult.scan.id)}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Kassenbon / Appraisal Receipt */}
        {activeTab === 'receipt' && (
          <ReceiptView
            receiptItems={receiptItems}
            onRemoveFromReceipt={handleRemoveFromReceipt}
            onClearReceipt={handleClearReceipt}
            onSwitchToScanner={() => setActiveTab('scanner')}
          />
        )}

        {/* Tab 3: History & Database */}
        {activeTab === 'history' && (
          <HistoryView
            onSelectScan={(scan) => {
              if (!receiptItems.some((r) => r.scan.id === scan.scan.id)) {
                handleAddToReceipt(scan);
              }
              setActiveTab('receipt');
            }}
          />
        )}

        {/* Tab 4: Repository Code Inspector */}
        {activeTab === 'repo' && <RepoExplorer />}
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-white/10 bg-[#0d0d0d] py-6 mt-12 text-center text-xs text-white/40 space-y-2">
        <div className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-wider text-white/50">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> PostgreSQL Ready
          </span>
          <span className="text-white/10">•</span>
          <span className="flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#c5a059]" /> Vision Classification API
          </span>
          <span className="text-white/10">•</span>
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#c5a059]" /> Pricing Microservice
          </span>
        </div>
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Aeterna Infrastructure v2.4.0 • Node.js / Express Gateway • FastAPI Python • Expo React Native
        </p>
      </footer>
    </div>
  );
}
