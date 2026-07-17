import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const QRScanner: React.FC = () => {
  const { setRoute } = useAppState();
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scannedRoom, setScannedRoom] = useState('');

  useEffect(() => {
    // Optional auto-timer to simulate scanning if user does nothing
    const timer = setTimeout(() => {
      handleSimulateScan();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSimulateScan = () => {
    setScannedRoom('Mesa 5 - Pabellón B (Piso 2)');
    setScanSuccess(true);
    setTimeout(() => {
      // Navigate to dashboard
      setRoute('dashboard');
    }, 2000);
  };

  return (
    <div className="flex flex-col flex-1 pb-16 bg-slate-950 text-white h-screen max-h-screen overflow-hidden justify-between">
      {/* Header */}
      <div className="bg-[#E86B6B] text-white px-4 py-4 flex items-center gap-3 shadow-md shrink-0">
        <button
          onClick={() => setRoute('dashboard')}
          className="p-1 rounded-full hover:bg-white/10 transition-colors active-press"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="p-2 bg-white/20 rounded-full border border-white/10 shrink-0">
          <QrCode size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold m-0 leading-tight">Escáner QR</h2>
          <p className="text-[11px] text-white/80 font-light">Pide directamente desde tu mesa</p>
        </div>
      </div>

      {/* Camera Viewfinder (Black/Dark grid) */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4">
        {/* Overlay grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

        {/* Viewfinder Target frame */}
        <div className="relative w-64 h-64 border-2 border-dashed border-white/30 rounded-3xl flex items-center justify-center overflow-hidden">
          {/* Laser Scanning Line */}
          {!scanSuccess && (
            <div className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_10px_#22c55e] animate-laser" />
          )}

          {scanSuccess ? (
            <div className="flex flex-col items-center justify-center text-center p-4 space-y-2 animate-in zoom-in-95 duration-200">
              <CheckCircle2 size={44} className="text-green-400 fill-green-950/40" />
              <h4 className="text-sm font-bold text-green-400">¡Escaneo Exitoso!</h4>
              <p className="text-xs text-white/80">{scannedRoom}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 text-white/40 space-y-2">
              <Camera size={36} className="stroke-[1.5px]" />
              <p className="text-xs">Apunta al código QR</p>
            </div>
          )}
          
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#E86B6B] rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#E86B6B] rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#E86B6B] rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#E86B6B] rounded-br-xl" />
        </div>

        <p className="text-xs text-white/50 text-center mt-6 max-w-xs leading-relaxed">
          El sistema detectará automáticamente tu ubicación para llevar tu orden express sin que hagas fila.
        </p>
      </div>

      {/* Simulation Button Footer */}
      <div className="bg-slate-900/80 p-4 border-t border-slate-800 text-center shrink-0">
        {!scanSuccess ? (
          <button
            onClick={handleSimulateScan}
            className="bg-[#E86B6B] hover:bg-[#E85757] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all active-press shadow-lg shadow-red-950/40 flex items-center gap-2 mx-auto"
          >
            <Sparkles size={14} className="text-yellow-200" />
            Simular Lectura QR
          </button>
        ) : (
          <span className="text-[10px] text-green-400 font-semibold uppercase tracking-wider animate-pulse">
            Redireccionando al menú del salón...
          </span>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
