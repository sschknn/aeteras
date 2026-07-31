import React, { useState } from 'react';
import { Receipt, Printer, Trash2, ShieldCheck, Download, Plus, DollarSign } from 'lucide-react';
import { ScanResponse } from '../types';

interface ReceiptViewProps {
  receiptItems: ScanResponse[];
  onRemoveFromReceipt: (index: number) => void;
  onClearReceipt: () => void;
  onSwitchToScanner: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  receiptItems,
  onRemoveFromReceipt,
  onClearReceipt,
  onSwitchToScanner,
}) => {
  const [taxMode, setTaxMode] = useState<'diff' | 'standard'>('diff');
  const [customerName, setCustomerName] = useState('Aeterna Auktion & Anauf GmbH');

  // Calculations
  const subtotalMedian = receiptItems.reduce(
    (acc, item) => acc + (item.pricing?.stats?.price_median || 0),
    0
  );
  const subtotalMin = receiptItems.reduce(
    (acc, item) => acc + (item.pricing?.stats?.price_min || 0),
    0
  );
  const subtotalMax = receiptItems.reduce(
    (acc, item) => acc + (item.pricing?.stats?.price_max || 0),
    0
  );

  const vatRate = taxMode === 'standard' ? 0.19 : 0.0;
  const vatAmount = Math.round(subtotalMedian * vatRate);
  const grandTotal = subtotalMedian + vatAmount;

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-sm p-4 sm:p-6 text-[#e0e0e0] shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-serif uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#c5a059]" />
            Kassenbon & Wertgutachten
          </h2>
          <p className="text-[11px] text-white/40 uppercase tracking-tight">
            Zusammenfassung aller erfassten Antiquitäten für An- & Verkauf oder Inventur.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {receiptItems.length > 0 && (
            <>
              <button
                onClick={onClearReceipt}
                className="px-3 py-1.5 bg-black/60 hover:bg-rose-950/80 text-rose-400 border border-white/10 hover:border-rose-800 rounded-sm text-[10px] uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Bon leeren
              </button>

              <button
                onClick={handlePrintReceipt}
                className="px-4 py-1.5 bg-[#c5a059] hover:bg-[#d6b16a] text-black rounded-sm text-[10px] font-serif font-bold uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                Drucken / PDF
              </button>
            </>
          )}
        </div>
      </div>

      {receiptItems.length === 0 ? (
        <div className="py-12 text-center space-y-4">
          <Receipt className="w-12 h-12 text-white/20 mx-auto" />
          <p className="text-xs text-white/40 uppercase tracking-wider">
            Noch keine Antiquitäten im Kassenbon. Scanne ein Objekt im Terminal, um es hinzuzufügen.
          </p>
          <button
            onClick={onSwitchToScanner}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#c5a059] text-black font-serif font-bold rounded-sm text-xs uppercase tracking-widest hover:bg-[#d6b16a] transition-colors shadow"
          >
            <Plus className="w-4 h-4" />
            Zum Scanner Terminal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Printable Receipt Canvas */}
          <div className="lg:col-span-2 bg-[#0a0a0a] p-6 rounded-sm border border-white/10 shadow-inner font-mono text-xs space-y-4 print:bg-white print:text-black print:p-0">
            {/* Dealer Certificate Header */}
            <div className="text-center border-b border-dashed border-white/20 pb-4 space-y-1">
              <h3 className="font-serif font-bold text-base text-[#c5a059] uppercase tracking-widest">
                AETERNA ANTIQUITÄTEN POS
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">
                SCHÄTZPROTOKOLL & INVENTAR-KASSENBON
              </p>
              <p className="text-[10px] text-white/30">
                Datum: {new Date().toLocaleDateString('de-DE')} • Pos-ID: #POS-2026-88
              </p>
            </div>

            {/* Customer Info Input */}
            <div className="flex items-center justify-between text-[11px] text-white/50 border-b border-white/5 pb-2">
              <span>Auftraggeber:</span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-black border border-white/10 rounded-sm px-2 py-0.5 text-[#c5a059] text-right outline-none focus:border-[#c5a059]"
              />
            </div>

            {/* Itemized Table */}
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-12 text-white/40 font-bold border-b border-white/10 pb-1 uppercase text-[9px] tracking-wider">
                <span className="col-span-6">Objekt / Epoche</span>
                <span className="col-span-3 text-right">Spanne</span>
                <span className="col-span-3 text-right">Kassenwert</span>
              </div>

              {receiptItems.map((scan, idx) => {
                const item = scan.item;
                const stats = scan.pricing?.stats;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 items-center text-white/80 py-1.5 border-b border-white/5 hover:bg-white/[0.02] rounded-sm px-1 transition-colors group"
                  >
                    <div className="col-span-6 pr-2">
                      <div className="font-bold text-[#c5a059]">{item.label}</div>
                      <div className="text-[10px] text-white/40">
                        {item.epoch} • {item.material}
                      </div>
                    </div>

                    <div className="col-span-3 text-right text-[10px] text-white/40">
                      {stats?.price_min}€ - {stats?.price_max}€
                    </div>

                    <div className="col-span-3 text-right font-mono font-bold text-[#c5a059] flex items-center justify-end gap-2">
                      <span>{stats?.price_median} €</span>
                      <button
                        onClick={() => onRemoveFromReceipt(idx)}
                        className="text-white/30 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Position entfernen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary Breakdown */}
            <div className="border-t-2 border-dashed border-white/20 pt-4 space-y-1.5">
              <div className="flex justify-between text-white/40">
                <span>Summe geschätzter Marktwert (Min):</span>
                <span>{subtotalMin} €</span>
              </div>
              <div className="flex justify-between text-white/40">
                <span>Summe geschätzter Marktwert (Max):</span>
                <span>{subtotalMax} €</span>
              </div>
              <div className="flex justify-between text-[#c5a059] font-bold text-xs pt-2 border-t border-white/10 uppercase tracking-wider">
                <span>Zwischensumme Median ({receiptItems.length} Objekte):</span>
                <span>{subtotalMedian} €</span>
              </div>

              {taxMode === 'standard' && (
                <div className="flex justify-between text-white/40 text-[11px]">
                  <span>zzgl. 19% MwSt. (Standard UStG):</span>
                  <span>+{vatAmount} €</span>
                </div>
              )}

              <div className="flex justify-between text-[#c5a059] font-serif font-bold text-base pt-2 border-t border-[#c5a059]/40">
                <span>GESAMTBETRAG SCHÄTZUNG:</span>
                <span className="text-xl font-mono">{grandTotal} €</span>
              </div>
            </div>

            {/* Footer Certificate Disclaimer */}
            <div className="text-[9px] text-white/30 pt-4 border-t border-white/5 text-center space-y-1">
              <p className="flex items-center justify-center gap-1 text-[#c5a059]/80 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" />
                Automatische KI-Klassifizierung & Price-Comparison Gateway
              </p>
              <p>Differenzbesteuerung nach §25a UStG möglich. Preise ohne Gewähr.</p>
            </div>
          </div>

          {/* POS Settings & Controls */}
          <div className="space-y-4">
            <div className="bg-[#0a0a0a] p-4 rounded-sm border border-white/10 space-y-4">
              <h3 className="font-serif font-bold text-xs uppercase tracking-widest text-[#c5a059]">
                Kasseneinstellungen & Tax
              </h3>

              <div className="space-y-2 text-xs">
                <label className="text-white/40 block font-medium text-[10px] uppercase tracking-wider">Besteuerungsart wählen:</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 p-2 rounded-sm bg-white/[0.02] border border-white/10 cursor-pointer">
                    <input
                      type="radio"
                      name="taxMode"
                      checked={taxMode === 'diff'}
                      onChange={() => setTaxMode('diff')}
                      className="accent-[#c5a059]"
                    />
                    <div>
                      <span className="font-bold text-white/90 text-xs">Differenzbesteuerung (§25a UStG)</span>
                      <p className="text-[10px] text-white/40">Gebrauchtgegenstände & Kunsthandelsgut</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-sm bg-white/[0.02] border border-white/10 cursor-pointer">
                    <input
                      type="radio"
                      name="taxMode"
                      checked={taxMode === 'standard'}
                      onChange={() => setTaxMode('standard')}
                      className="accent-[#c5a059]"
                    />
                    <div>
                      <span className="font-bold text-white/90 text-xs">Standard 19% MwSt.</span>
                      <p className="text-[10px] text-white/40">Regelbesteuerung auf Gesamtsumme</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-sm border border-white/10 text-xs space-y-2">
              <div className="font-serif font-bold text-[#c5a059] uppercase tracking-widest text-xs flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#c5a059]" />
                Inventar-Statistik
              </div>
              <div className="flex justify-between text-white/60">
                <span>Erfasste Stücke:</span>
                <span className="font-mono font-bold text-[#c5a059]">{receiptItems.length}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Durchschnitt / Stück:</span>
                <span className="font-mono font-bold text-[#c5a059]">
                  {receiptItems.length ? Math.round(subtotalMedian / receiptItems.length) : 0} €
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
