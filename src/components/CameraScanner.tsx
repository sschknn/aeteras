import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Image as ImageIcon, Sparkles, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MOCK_PRESET_ANTIQUES } from '../data/mockAntiques';
import { ScanResponse, SamplePreset } from '../types';

interface CameraScannerProps {
  onScanComplete: (result: ScanResponse) => void;
  isScanning: boolean;
  setIsScanning: (val: boolean) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onScanComplete,
  isScanning,
  setIsScanning,
}) => {
  const [mode, setMode] = useState<'preset' | 'camera' | 'upload'>('preset');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<SamplePreset>(MOCK_PRESET_ANTIQUES[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanNotes, setScanNotes] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start HTML5 Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Kamera-Zugriff fehlgeschlagen:', err);
      setCameraError('Kamera konnte nicht gestartet werden. Bitte nutze den Bild-Upload oder die Muster-Objekte.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Scan API
  const handleExecuteScan = async () => {
    try {
      setIsScanning(true);
      let payload: any = {
        userId: 'kassierer_pos_1',
        notes: scanNotes || 'Scannervorgang an der Kasse'
      };

      if (mode === 'preset') {
        payload.sampleId = selectedPreset.id;
        payload.imageBase64 = selectedPreset.imageUrl;
      } else if (mode === 'upload' && uploadedImage) {
        payload.imageBase64 = uploadedImage;
      } else if (mode === 'camera' && videoRef.current) {
        // Capture frame from video stream
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          payload.imageBase64 = canvas.toDataURL('image/jpeg', 0.85);
        }
      }

      console.log('Sende Scan-Payload an API Gateway /api/scan...');
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gateway Error (${response.status})`);
      }

      const result: ScanResponse = await response.json();
      setIsScanning(false);
      onScanComplete(result);
    } catch (err: any) {
      console.error('Scan Error:', err);
      setIsScanning(false);
      alert('Fehler beim Antiquitäten-Scan: ' + err.message);
    }
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/10 rounded-sm p-4 sm:p-6 text-[#e0e0e0] shadow-2xl space-y-6">
      {/* Scanner Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-serif uppercase tracking-widest text-[#c5a059] flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#c5a059]" />
            Vision Service & Erfassung
          </h2>
          <p className="text-[11px] text-white/40 uppercase tracking-tight">
            Objekt scannen zur KI-Epochenbestimmung & Marktpreis-Ermittlung
          </p>
        </div>

        <div className="flex items-center bg-[#0a0a0a] p-1 rounded-sm border border-white/10 text-xs">
          <button
            onClick={() => setMode('preset')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold text-[10px] uppercase tracking-wider transition-all ${
              mode === 'preset'
                ? 'bg-[#c5a059] text-black font-bold shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Muster-Objekte
          </button>

          <button
            onClick={() => setMode('camera')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold text-[10px] uppercase tracking-wider transition-all ${
              mode === 'camera'
                ? 'bg-[#c5a059] text-black font-bold shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Live-Kamera
          </button>

          <button
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-semibold text-[10px] uppercase tracking-wider transition-all ${
              mode === 'upload'
                ? 'bg-[#c5a059] text-black font-bold shadow'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Bild Upload
          </button>
        </div>
      </div>

      {/* Mode 1: Preset Objects Gallery */}
      {mode === 'preset' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {MOCK_PRESET_ANTIQUES.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`group relative rounded-sm overflow-hidden border text-left transition-all aspect-square ${
                    isSelected
                      ? 'border-[#c5a059] ring-1 ring-[#c5a059] scale-[1.02]'
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-2 flex flex-col justify-end">
                    <span className="text-[9px] font-bold text-[#c5a059] uppercase tracking-widest block truncate">
                      {preset.epoch.split(' ')[0]}
                    </span>
                    <span className="text-xs font-medium text-white line-clamp-2 leading-tight">
                      {preset.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-[#c5a059] text-black p-0.5 rounded-full shadow">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-white/5 p-3 rounded-sm border border-white/10 text-xs text-white/70 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
            <div>
              <p className="font-serif text-[#c5a059] font-bold">{selectedPreset.name}</p>
              <p className="text-white/50 text-[11px] mt-0.5">{selectedPreset.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Live HTML5 Camera */}
      {mode === 'camera' && (
        <div className="space-y-4">
          {cameraError ? (
            <div className="bg-rose-950/60 border border-rose-800/80 p-4 rounded-sm text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          ) : (
            <div className="relative w-full h-64 sm:h-80 bg-black rounded-sm overflow-hidden border border-white/20 flex items-center justify-center group">
              {/* Corner brackets in Sophisticated Dark style */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#c5a059] z-10 pointer-events-none"></div>
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#c5a059] z-10 pointer-events-none"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#c5a059] z-10 pointer-events-none"></div>
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#c5a059] z-10 pointer-events-none"></div>

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Target Bracket overlay */}
              <div className="absolute inset-0 border border-dashed border-[#c5a059]/40 m-8 rounded-sm pointer-events-none flex items-center justify-center">
                <div className="text-[10px] uppercase font-mono tracking-widest text-[#c5a059] bg-black/80 px-3 py-1 rounded-sm border border-[#c5a059]/40 backdrop-blur">
                  Kamera-Analyse aktiv
                </div>
              </div>

              {isScanning && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3 z-20">
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-[0_0_15px_#c5a059]" />
                  <RefreshCw className="w-8 h-8 text-[#c5a059] animate-spin" />
                  <p className="text-xs font-serif uppercase tracking-widest text-[#c5a059]">
                    Vision-Analyse in Bearbeitung...
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 3: Image Upload */}
      {mode === 'upload' && (
        <div className="space-y-4">
          {uploadedImage ? (
            <div className="relative w-full h-64 bg-black rounded-sm overflow-hidden border border-white/20 flex items-center justify-center group">
              <img src={uploadedImage} alt="Uploaded Scan" className="w-full h-full object-contain" />
              <button
                onClick={() => setUploadedImage(null)}
                className="absolute top-2 right-2 bg-black/80 text-white/80 hover:text-white px-3 py-1 text-[10px] uppercase tracking-wider rounded-sm border border-white/20 backdrop-blur"
              >
                Anderes Bild wählen
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border border-dashed border-white/20 hover:border-[#c5a059] rounded-sm cursor-pointer bg-white/[0.02] hover:bg-white/[0.05] transition-all p-6 text-center">
              <Upload className="w-8 h-8 text-[#c5a059] mb-2" />
              <p className="text-xs uppercase font-serif tracking-widest text-[#c5a059]">
                Bilddatei hochladen
              </p>
              <p className="text-[10px] text-white/40 mt-1 uppercase tracking-tight">
                Unterstützt PNG, JPG, WEBP
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Optional Scan Notes */}
      <div className="mt-4">
        <input
          type="text"
          value={scanNotes}
          onChange={(e) => setScanNotes(e.target.value)}
          placeholder="Notiz zum Kassenvorgang (z.B. Kundenname, Standort, Zustand)..."
          className="w-full bg-[#0a0a0a] border border-white/10 focus:border-[#c5a059] rounded-sm px-3 py-2 text-xs text-white/90 placeholder:text-white/30 outline-none transition-colors"
        />
      </div>

      {/* Execute Scan Trigger Button */}
      <button
        onClick={handleExecuteScan}
        disabled={isScanning || (mode === 'upload' && !uploadedImage)}
        className="w-full mt-4 bg-[#c5a059] hover:bg-[#d6b16a] text-black font-serif uppercase tracking-widest text-xs font-bold py-3 px-6 rounded-sm shadow-lg active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isScanning ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-black" />
            <span>Klassifiziere & ermittle Marktpreise...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-black" />
            <span>Antiquität jetzt scannen & bewerten</span>
          </>
        )}
      </button>
    </div>
  );
};
