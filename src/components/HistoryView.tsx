import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Trash2, ChevronRight, RefreshCw, X, Tag, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { ScanResponse, ScanRecord } from '../types';

interface HistoryViewProps {
  onSelectScan: (scan: ScanResponse) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onSelectScan }) => {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScanDetail, setSelectedScanDetail] = useState<ScanResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/scans');
      const data = await res.json();
      setScans(data);
    } catch (err) {
      console.warn('Scans laden fehlgeschlagen:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, []);

  // Fetch full details for modal
  const handleOpenDetail = async (scanId: number) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`/api/scan/${scanId}`);
      const data = await res.json();
      setSelectedScanDetail(data);
    } catch (err) {
      console.error('Scan Details konnten nicht geladen werden', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Delete Scan
  const handleDeleteScan = async (e: React.MouseEvent, scanId: number) => {
    e.stopPropagation();
    if (!confirm('Soll dieser Kassenvorgang aus der Datenbank gelöscht werden?')) return;

    try {
      await fetch(`/api/scan/${scanId}`, { method: 'DELETE' });
      setScans((prev) => prev.filter((s) => (s.scan_id || s.id) !== scanId));
      if (selectedScanDetail?.scan?.id === scanId) {
        setSelectedScanDetail(null);
      }
    } catch (err) {
      console.error('Löschen fehlgeschlagen:', err);
    }
  };

  // Filtered scans
  const filteredScans = scans.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      (s.label && s.label.toLowerCase().includes(query)) ||
      (s.epoch && s.epoch.toLowerCase().includes(query)) ||
      (s.material && s.material.toLowerCase().includes(query)) ||
      (s.origin && s.origin.toLowerCase().includes(query))
    );
  });

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-sm p-4 sm:p-6 text-[#e0e0e0] shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-serif uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
            <History className="w-5 h-5 text-[#c5a059]" />
            Transaktions- & Scan-Verlauf (PostgreSQL DB)
          </h2>
          <p className="text-[11px] text-white/40 uppercase tracking-tight">
            Historie aller Antiquitäten-Scans, Preissnapshots und Angebote.
          </p>
        </div>

        <button
          onClick={fetchScans}
          className="p-2 bg-[#0a0a0a] hover:bg-white/5 text-[#c5a059] border border-white/10 rounded-sm text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Aktualisieren</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Verlauf durchsuchen nach Objektbezeichnung, Epoche, Material..."
          className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#c5a059] rounded-sm pl-9 pr-4 py-2.5 text-xs text-white/90 placeholder:text-white/30 outline-none transition-colors"
        />
      </div>

      {/* Scans List Table / Cards */}
      {loading ? (
        <div className="py-12 text-center text-white/40 flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 text-[#c5a059] animate-spin" />
          <span className="text-xs uppercase tracking-wider">Lade Datenbank-Einträge...</span>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="py-12 text-center text-white/30 text-xs uppercase tracking-wider">
          Keine Scans gefunden. Führe im Terminal einen ersten Antiquitäten-Scan durch.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredScans.map((s) => {
            const scanId = s.scan_id || s.id;
            return (
              <div
                key={scanId}
                onClick={() => handleOpenDetail(scanId)}
                className="bg-[#0a0a0a] p-3.5 rounded-sm border-l-2 border-[#c5a059] border-y border-r border-white/5 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif font-bold text-white truncate">
                      {s.label}
                    </span>
                    <span className="text-[9px] bg-white/5 text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded-sm font-mono uppercase tracking-wider shrink-0">
                      {s.epoch}
                    </span>
                  </div>
                  <div className="text-[11px] text-white/40 flex items-center gap-3">
                    <span>{s.material || 'Keramik/Glas/Bronze'}</span>
                    <span>•</span>
                    <span>{s.origin || 'Deutschland'}</span>
                    <span>•</span>
                    <span className="text-white/30 font-mono text-[10px]">
                      {new Date(s.ts).toLocaleString('de-DE')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[9px] text-white/30 uppercase tracking-wider">Schätzwert</div>
                    <div className="text-xs font-bold text-[#c5a059] font-mono">
                      {s.price_median || 0} €
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteScan(e, scanId)}
                    className="p-2 text-white/30 hover:text-rose-400 hover:bg-rose-950/40 rounded-sm transition-colors"
                    title="Scan löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-[#c5a059] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scan Detail Modal */}
      {selectedScanDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-[#c5a059] rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-[#e0e0e0] shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedScanDetail(null)}
              className="absolute top-4 right-4 p-1.5 text-white/40 hover:text-white bg-[#0a0a0a] rounded-sm border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-3">
              <span className="text-[10px] text-[#c5a059] font-mono uppercase tracking-widest block">
                GET /scan/{selectedScanDetail.scan.id} • Detailansicht
              </span>
              <h3 className="text-xl font-serif text-[#c5a059] mt-1 italic">
                {selectedScanDetail.item.label}
              </h3>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">
                Gespeichert am {new Date(selectedScanDetail.scan.ts).toLocaleString('de-DE')}
              </p>
            </div>

            {/* Price Snapshot Stats */}
            <div className="bg-[#0a0a0a] p-4 rounded-sm border border-white/10 space-y-2">
              <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">Price Snapshot (Mediane):</span>
              <div className="text-2xl font-serif font-bold text-[#c5a059]">
                {selectedScanDetail.pricing.stats.price_median} €
              </div>
              <p className="text-xs text-white/60">
                Preisbereich: {selectedScanDetail.pricing.stats.price_min} € bis{' '}
                {selectedScanDetail.pricing.stats.price_max} € across{' '}
                {selectedScanDetail.pricing.stats.platform_count} Marktplätzen
              </p>
            </div>

            {/* Offers */}
            <div>
              <h4 className="text-xs font-serif font-bold text-[#c5a059] uppercase tracking-widest mb-2">
                Gespeicherte Angebote
              </h4>
              <div className="space-y-1.5">
                {selectedScanDetail.pricing.offers.map((off, i) => (
                  <div
                    key={i}
                    className="bg-[#0a0a0a] p-2.5 rounded-sm border border-white/5 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-[#c5a059]">{off.platform}</span>
                      <p className="text-white/60 truncate max-w-sm">{off.title}</p>
                    </div>
                    <span className="font-mono font-bold text-[#c5a059]">{off.price} €</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  onSelectScan(selectedScanDetail);
                  setSelectedScanDetail(null);
                }}
                className="px-4 py-2 bg-[#c5a059] hover:bg-[#d6b16a] text-black font-serif uppercase tracking-widest font-bold rounded-sm text-xs transition-colors"
              >
                In Kassenbon aufnehmen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
