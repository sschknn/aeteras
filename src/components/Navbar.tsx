import React from 'react';
import { Camera, Receipt, History, Code, Sparkles, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'receipt' | 'history' | 'repo';
  setActiveTab: (tab: 'scanner' | 'receipt' | 'history' | 'repo') => void;
  receiptCount: number;
  totalScanCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  receiptCount,
  totalScanCount,
}) => {
  return (
    <header className="bg-[#0f0f0f] text-[#e0e0e0] border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('scanner')}>
            <div className="w-8 h-8 border border-[#c5a059] flex items-center justify-center rounded-sm bg-black/40">
              <div className="w-4 h-4 bg-[#c5a059] opacity-90 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-black" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg text-[#c5a059] uppercase tracking-widest">
                  Aeterna <span className="text-white opacity-40 font-sans tracking-normal font-light">Scanner</span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-white/5 text-[#c5a059] border border-white/10">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> POS 1.0
                </span>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-tight hidden sm:block">
                KI-Vision Epochenbestimmung • Live-Marktpreis-Vergleich • Gateway POS
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                activeTab === 'scanner'
                  ? 'bg-[#c5a059] text-black font-bold shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                  : 'text-white/60 hover:text-[#c5a059] hover:bg-white/5 border border-transparent'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Scanner Terminal</span>
              <span className="md:hidden">Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('receipt')}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                activeTab === 'receipt'
                  ? 'bg-[#c5a059] text-black font-bold shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                  : 'text-white/60 hover:text-[#c5a059] hover:bg-white/5 border border-transparent'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kassenbon</span>
              <span className="md:hidden">Bon</span>
              {receiptCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-sm ${
                  activeTab === 'receipt' ? 'bg-black text-[#c5a059]' : 'bg-[#c5a059] text-black'
                }`}>
                  {receiptCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                activeTab === 'history'
                  ? 'bg-[#c5a059] text-black font-bold shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                  : 'text-white/60 hover:text-[#c5a059] hover:bg-white/5 border border-transparent'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Scan-Verlauf</span>
              <span className="md:hidden">Verlauf</span>
              {totalScanCount > 0 && (
                <span className={`ml-1 px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-sm ${
                  activeTab === 'history' ? 'bg-black text-[#c5a059]' : 'bg-white/10 text-[#c5a059] border border-[#c5a059]/40'
                }`}>
                  {totalScanCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('repo')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all rounded-sm ${
                activeTab === 'repo'
                  ? 'bg-[#c5a059] text-black font-bold shadow-[0_0_12px_rgba(197,160,89,0.25)]'
                  : 'text-white/60 hover:text-[#c5a059] hover:bg-white/5 border border-transparent'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Code & Repo</span>
              <span className="md:hidden">Code</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
