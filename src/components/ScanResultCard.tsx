import React from 'react';
import { Sparkles, ShoppingBag, ExternalLink, PlusCircle, Check, DollarSign, Calendar, Tag, Globe2 } from 'lucide-react';
import { ScanResponse, Offer } from '../types';

interface ScanResultCardProps {
  scanResult: ScanResponse;
  onAddToReceipt: (scan: ScanResponse) => void;
  isAddedToReceipt?: boolean;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({
  scanResult,
  onAddToReceipt,
  isAddedToReceipt = false,
}) => {
  const { item, pricing } = scanResult;
  const stats = pricing?.stats || { price_min: 0, price_max: 0, price_median: 0, platform_count: 0 };
  const offers: Offer[] = pricing?.offers || [];

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-sm p-5 sm:p-6 text-[#e0e0e0] shadow-2xl space-y-6">
      {/* Top Header & Epoch Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-white/5 text-[#c5a059] border border-[#c5a059]/40 px-2.5 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-wider">
              {item.epoch || 'Antik'}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              KI-Konfidenz: {Math.round((item.confidence || 0.85) * 100)}%
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-[#c5a059] italic">
            {item.label}
          </h2>
        </div>

        <button
          onClick={() => onAddToReceipt(scanResult)}
          disabled={isAddedToReceipt}
          className={`shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm font-serif font-bold text-xs uppercase tracking-widest transition-all ${
            isAddedToReceipt
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 cursor-default'
              : 'bg-[#c5a059] hover:bg-[#d6b16a] text-black shadow-md active:scale-95'
          }`}
        >
          {isAddedToReceipt ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>In Kassenbon übernommen</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>In Kassenbon aufnehmen</span>
            </>
          )}
        </button>
      </div>

      {/* Classification Meta Attributes Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white/[0.02] p-3 rounded-sm border border-white/5">
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-white/40 mb-1">
            <Tag className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Material</span>
          </div>
          <p className="text-xs font-medium text-white">{item.material || 'Guss / Glas'}</p>
        </div>

        <div className="bg-white/[0.02] p-3 rounded-sm border border-white/5">
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-white/40 mb-1">
            <Globe2 className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Herkunft</span>
          </div>
          <p className="text-xs font-medium text-white">{item.origin || 'Europa'}</p>
        </div>

        <div className="bg-white/[0.02] p-3 rounded-sm border border-white/5 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-white/40 mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Epoche</span>
          </div>
          <p className="text-xs font-medium text-[#c5a059]">{item.epoch}</p>
        </div>
      </div>

      {item.description && (
        <div className="bg-white/[0.02] p-3 rounded-sm border border-white/5 text-xs text-white/60 italic font-serif">
          "{item.description}"
        </div>
      )}

      {/* Valuation Range Box */}
      <div className="bg-white/5 p-4 sm:p-5 rounded-sm border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="font-serif font-bold text-[#c5a059] text-xs uppercase tracking-widest flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#c5a059]" />
            Pricing Service • Median Schätzung
          </h3>
          <span className="text-[10px] text-white/40 font-mono">
            {stats.platform_count} Quellen
          </span>
        </div>

        {/* Min, Median, Max Display */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-black/40 p-3 rounded-sm border border-white/5">
            <span className="text-[9px] text-white/40 uppercase tracking-widest block font-sans">
              Min. Marktpreis
            </span>
            <span className="text-base sm:text-lg font-mono font-bold text-white/80">
              {stats.price_min} €
            </span>
          </div>

          <div className="bg-black/60 p-3 rounded-sm border border-[#c5a059]">
            <span className="text-[9px] text-[#c5a059] uppercase tracking-widest font-bold block">
              Median (Kassenwert)
            </span>
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#c5a059]">
              {stats.price_median} €
            </span>
          </div>

          <div className="bg-black/40 p-3 rounded-sm border border-white/5">
            <span className="text-[9px] text-white/40 uppercase tracking-widest block font-sans">
              Max. Schätzwert
            </span>
            <span className="text-base sm:text-lg font-mono font-bold text-white/80">
              {stats.price_max} €
            </span>
          </div>
        </div>

        {/* Visual Bar representation */}
        <div className="space-y-1">
          <div className="w-full bg-black h-2 rounded-full overflow-hidden p-0.5 border border-white/10 flex">
            <div className="bg-white/10 h-full rounded-l-full" style={{ width: '25%' }} />
            <div className="bg-[#c5a059] h-full" style={{ width: '50%' }} />
            <div className="bg-white/10 h-full rounded-r-full" style={{ width: '25%' }} />
          </div>
          <div className="flex justify-between text-[9px] text-white/30 font-mono uppercase tracking-wider">
            <span>Unterer Bereich</span>
            <span className="text-[#c5a059] font-bold">Durchschnittlicher Marktwert</span>
            <span>Oberer Galeriepreis</span>
          </div>
        </div>
      </div>

      {/* Offers Comparison List */}
      <div>
        <h3 className="font-serif font-bold text-[#c5a059] text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[#c5a059]" />
          Aktive Referenz-Angebote ({offers.length})
        </h3>

        <div className="space-y-2">
          {offers.map((offer, idx) => (
            <div
              key={idx}
              className="bg-black/40 p-3 rounded-sm border border-white/5 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">{offer.platform}</span>
                  <span className="text-[9px] bg-white/5 text-white/40 px-2 py-0.5 rounded-sm border border-white/10 uppercase">
                    {offer.condition}
                  </span>
                </div>
                <p className="text-xs text-white/60 truncate">{offer.title}</p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <span className="text-xs font-mono text-[#c5a059]">
                  {offer.price} {offer.currency}
                </span>
                {offer.url && (
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-white/5 hover:bg-[#c5a059] text-white/40 hover:text-black rounded-sm border border-white/10 transition-colors"
                    title="Angebot auf Plattform öffnen"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
