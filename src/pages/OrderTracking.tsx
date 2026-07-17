import React from 'react';
import { ArrowLeft, Clock, Check, Coffee, Sparkles, Navigation } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const OrderTracking: React.FC = () => {
  const { activeOrder, advanceOrder, setRoute } = useAppState();

  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Clock size={48} className="text-gray-300 animate-spin-slow" />
        <h3 className="font-bold text-gray-800">No hay órdenes activas</h3>
        <button
          onClick={() => setRoute('dashboard')}
          className="bg-[#E86B6B] text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          Volver a Inicio
        </button>
      </div>
    );
  }

  const { id, item, precio, estado, tiempoRestante } = activeOrder;

  const steps = [
    { key: 'received', label: 'Pedido Recibido', desc: 'Tu orden fue enviada a la cocina.' },
    { key: 'preparing', label: 'En Preparación', desc: 'Estamos preparando tu orden express.' },
    { key: 'ready', label: 'Listo para Retirar', desc: '¡Recógelo en el counter express!' },
  ];

  // Helper to determine step index
  const getStepIndex = (st: string) => {
    if (st === 'received') return 0;
    if (st === 'preparing') return 1;
    if (st === 'ready') return 2;
    return 3;
  };

  const currentIdx = getStepIndex(estado);

  return (
    <div className="flex flex-col flex-1 pb-16 bg-gray-50 h-screen max-h-screen overflow-hidden justify-between">
      {/* Header */}
      <div className="bg-[#E86B6B] text-white px-4 py-4 flex items-center gap-3 shadow-md shrink-0">
        <button
          onClick={() => setRoute('dashboard')}
          className="p-1 rounded-full hover:bg-white/10 transition-colors active-press"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="p-2 bg-white/20 rounded-full border border-white/10 shrink-0">
          <Clock size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold m-0 leading-tight">Seguimiento de Pedido</h2>
          <p className="text-[11px] text-white/80 font-light">Estado de preparación express</p>
        </div>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
        {/* Order Header Info Card */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase">Código de Pedido</span>
            <h3 className="text-sm font-extrabold text-gray-800 mt-0.5">{id}</h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>{item.emoji}</span>
              <span>{item.nombre}</span>
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[#E86B6B]">Total pagado</span>
            <h4 className="text-sm font-extrabold text-gray-850 mt-0.5">S/ {precio.toFixed(2)}</h4>
          </div>
        </div>

        {/* Steps Tracking Line */}
        <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-450">Progreso</h4>

          <div className="relative pl-7 space-y-8">
            {/* Vertical Bar */}
            <div className="absolute left-3 top-2.5 bottom-2.5 w-0.5 bg-gray-100">
              <div
                className="w-full bg-[#E86B6B] transition-all duration-500"
                style={{
                  height: `${currentIdx === 0 ? '0%' : currentIdx === 1 ? '50%' : '100%'}`,
                }}
              />
            </div>

            {/* Loop through steps */}
            {steps.map((step, idx) => {
              const isActive = estado === step.key;
              const isPassed = getStepIndex(estado) > idx;

              let bulletStyle = 'bg-gray-100 text-gray-400 border-2 border-transparent';
              if (isActive) {
                bulletStyle = 'bg-[#E86B6B] text-white border-2 border-[#E9D5FF] ring-4 ring-red-100';
              } else if (isPassed) {
                bulletStyle = 'bg-green-500 text-white border-2 border-transparent';
              }

              return (
                <div key={step.key} className="relative flex items-start gap-4 transition-opacity">
                  {/* Step Bullet */}
                  <div
                    className={`absolute -left-6.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${bulletStyle}`}
                    style={{ left: '-27px' }}
                  >
                    {isPassed ? (
                      <Check size={12} className="stroke-[2.5px]" />
                    ) : step.key === 'preparing' && isActive ? (
                      <Coffee size={12} className="animate-pulse" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <div>
                    <h5
                      className={`text-xs font-bold transition-colors ${
                        isActive ? 'text-gray-850' : isPassed ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h5>
                    <p className="text-[11px] text-gray-400 leading-normal mt-0.5">
                      {step.desc}
                    </p>
                    
                    {isActive && tiempoRestante > 0 && (
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#E86B6B] bg-red-50 px-2 py-0.5 rounded animate-pulse">
                        Quedan {tiempoRestante}s
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informative notification box */}
        {estado === 'ready' && (
          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-start gap-3 animate-bounce">
            <Sparkles className="text-green-600 shrink-0 mt-0.5" size={16} />
            <div>
              <h5 className="text-xs font-bold text-green-800">¡Pedido Listo!</h5>
              <p className="text-[11px] text-green-700 leading-normal mt-0.5">
                Acércate a la barra express de la cafetería con el código <strong className="font-bold">{id}</strong> para retirar tu sándwich/bebida sin hacer fila.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Actions Footer */}
      <div className="bg-white border-t border-gray-100 p-4 shrink-0 space-y-2 text-center shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        {estado !== 'ready' && estado !== 'completed' ? (
          <button
            onClick={advanceOrder}
            className="w-full bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold py-2.5 rounded-xl transition-all active-press flex items-center justify-center gap-1.5"
          >
            <Navigation size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
            Simular Avance Rápido
          </button>
        ) : (
          <button
            onClick={advanceOrder}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-3.5 rounded-xl transition-all active-press shadow-lg shadow-green-100 text-center"
          >
            Completar Retiro del Pedido
          </button>
        )}
        <span className="text-[9px] text-gray-400 block font-light">
          Los estados cambian automáticamente gracias al simulador interno de SmartCafé.
        </span>
      </div>
    </div>
  );
};

export default OrderTracking;
