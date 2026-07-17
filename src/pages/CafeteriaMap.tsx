import React, { useState } from 'react';
import { ArrowLeft, Map, Bolt, Inbox, Coffee, HelpCircle, Info } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const CafeteriaMap: React.FC = () => {
  const { setRoute, lockers, toggleLocker, mesas, toggleMesa } = useAppState();
  const [selectedElement, setSelectedElement] = useState<{
    type: 'mesa' | 'locker';
    id: number;
    status: boolean;
  } | null>(null);

  const handleMesaClick = (id: number, ocupada: boolean) => {
    setSelectedElement({ type: 'mesa', id, status: ocupada });
  };

  const handleLockerClick = (id: number, reservado: boolean) => {
    setSelectedElement({ type: 'locker', id, status: reservado });
  };

  const confirmAction = () => {
    if (!selectedElement) return;

    if (selectedElement.type === 'mesa') {
      toggleMesa(selectedElement.id);
      setSelectedElement(prev => prev ? { ...prev, status: !prev.status } : null);
    } else if (selectedElement.type === 'locker') {
      toggleLocker(selectedElement.id);
      setSelectedElement(prev => prev ? { ...prev, status: !prev.status } : null);
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-20 overflow-y-auto">
      {/* 1. Header */}
      <div className="bg-[#E86B6B] text-white px-4 py-4 flex items-center gap-3 shadow-md shrink-0">
        <button
          onClick={() => setRoute('dashboard')}
          className="p-1 rounded-full hover:bg-white/10 transition-colors active-press"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="p-2 bg-white/20 rounded-full border border-white/10 shrink-0">
          <Map size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold m-0 leading-tight">Mapa de Cafetería</h2>
          <p className="text-[11px] text-white/80 font-light">Disponibilidad en tiempo real</p>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col">
        {/* 2. Legend Bar */}
        <div className="bg-white rounded-xl border border-gray-150 p-3 shadow-xs grid grid-cols-4 text-[10px] font-bold text-gray-500 text-center gap-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            <span>Libre</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
            <span>Ocupado</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Bolt size={12} className="text-amber-500" />
            <span>Enchufe</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Inbox size={12} className="text-purple-500" />
            <span>Lockers</span>
          </div>
        </div>

        {/* 3. Interactive Map (SVG inside Card) */}
        <div className="bg-slate-900 rounded-2xl p-4 shadow-inner flex-1 flex flex-col justify-center border border-slate-950 relative min-h-[300px]">
          {/* Top Banner overlay */}
          <div className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            <Info size={10} /> Toca un objeto para interactuar
          </div>

          {/* SVG Map */}
          <svg
            viewBox="0 0 400 350"
            className="w-full h-auto drop-shadow-2xl select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outline bounds */}
            <rect x="10" y="10" width="380" height="330" rx="15" fill="none" stroke="#334155" strokeWidth="2" strokeDasharray="6,4" />

            {/* Entrance / Exit markers */}
            <text x="30" y="335" fill="#475569" fontSize="10" fontWeight="bold">INGRESO PRINCIPAL</text>
            
            {/* Counter area (Caja / Recojo) */}
            <rect x="250" y="30" width="120" height="45" rx="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
            <text x="310" y="56" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">Caja y Entrega</text>
            <Coffee x="260" y="42" size={16} className="text-[#E86B6B]" />

            {/* Lockers Bank (Interactive) */}
            <rect x="30" y="30" width="150" height="40" rx="8" fill="#1e293b" stroke="#3b0764" strokeWidth="1" />
            <text x="105" y="44" fill="#a855f7" fontSize="8" fontWeight="bold" textAnchor="middle">SMART LOCKERS</text>
            {lockers.map((lock, index) => {
              const xPos = 35 + index * 14;
              const yPos = 50;
              const color = lock.reservado ? '#EF4444' : '#22C55E';
              const isSelected = selectedElement?.type === 'locker' && selectedElement.id === lock.id;

              return (
                <rect
                  key={lock.id}
                  x={xPos}
                  y={yPos}
                  width="11"
                  height="12"
                  rx="1"
                  fill={color}
                  stroke={isSelected ? '#FFFFFF' : 'none'}
                  strokeWidth={1.5}
                  className="cursor-pointer hover:opacity-85 transition-opacity"
                  onClick={() => handleLockerClick(lock.id, lock.reservado)}
                />
              );
            })}

            {/* Tables Area (Grid of tables) */}
            {/* Table 1-4: Top zone */}
            {mesas.slice(0, 4).map((m, idx) => {
              const xPos = 60 + idx * 80;
              const yPos = 120;
              const color = m.ocupada ? '#EF4444' : '#22C55E';
              const isSelected = selectedElement?.type === 'mesa' && selectedElement.id === m.id;

              return (
                <g key={m.id} className="cursor-pointer" onClick={() => handleMesaClick(m.id, m.ocupada)}>
                  {/* Table outline */}
                  <rect x={xPos} y={yPos} width="35" height="35" rx="6" fill="#192231" stroke={isSelected ? '#FFFFFF' : '#334155'} strokeWidth={isSelected ? 2 : 1} />
                  {/* Chairs */}
                  <circle cx={xPos + 17.5} cy={yPos - 5} r="4" fill={color} />
                  <circle cx={xPos + 17.5} cy={yPos + 40} r="4" fill={color} />
                  <circle cx={xPos - 5} cy={yPos + 17.5} r="4" fill={color} />
                  <circle cx={xPos + 40} cy={yPos + 17.5} r="4" fill={color} />
                  {/* Label */}
                  <text x={xPos + 17.5} y={yPos + 21} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">M{m.id}</text>
                </g>
              );
            })}

            {/* Table 5-8: Middle zone with charging points */}
            {mesas.slice(4, 8).map((m, idx) => {
              const xPos = 60 + idx * 80;
              const yPos = 200;
              const color = m.ocupada ? '#EF4444' : '#22C55E';
              const isSelected = selectedElement?.type === 'mesa' && selectedElement.id === m.id;

              return (
                <g key={m.id} className="cursor-pointer" onClick={() => handleMesaClick(m.id, m.ocupada)}>
                  {/* Table outline */}
                  <circle cx={xPos + 17.5} cy={yPos + 17.5} r="18" fill="#192231" stroke={isSelected ? '#FFFFFF' : '#334155'} strokeWidth={isSelected ? 2 : 1} />
                  {/* Chairs */}
                  <circle cx={xPos + 17.5} cy={yPos - 5} r="4" fill={color} />
                  <circle cx={xPos + 17.5} cy={yPos + 40} r="4" fill={color} />
                  {/* Label */}
                  <text x={xPos + 17.5} y={yPos + 21} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">M{m.id}</text>
                  {/* Power Outlet Icon inside/next to table */}
                  <Bolt x={xPos + 12} y={yPos + 25} size={10} className="text-amber-500" />
                </g>
              );
            })}

            {/* Table 9-12: Bottom zone */}
            {mesas.slice(8, 12).map((m, idx) => {
              const xPos = 60 + idx * 80;
              const yPos = 270;
              const color = m.ocupada ? '#EF4444' : '#22C55E';
              const isSelected = selectedElement?.type === 'mesa' && selectedElement.id === m.id;

              return (
                <g key={m.id} className="cursor-pointer" onClick={() => handleMesaClick(m.id, m.ocupada)}>
                  {/* Table outline */}
                  <rect x={xPos} y={yPos} width="35" height="35" rx="6" fill="#192231" stroke={isSelected ? '#FFFFFF' : '#334155'} strokeWidth={isSelected ? 2 : 1} />
                  {/* Chairs */}
                  <circle cx={xPos - 5} cy={yPos + 17.5} r="4" fill={color} />
                  <circle cx={xPos + 40} cy={yPos + 17.5} r="4" fill={color} />
                  {/* Label */}
                  <text x={xPos + 17.5} y={yPos + 21} fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">M{m.id}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 4. Selection Info Panel & Interaction CTA */}
        {selectedElement ? (
          <div className="bg-white border border-purple-100 rounded-2xl p-4 shadow-md flex items-center justify-between animate-in slide-in-from-bottom duration-250">
            <div>
              <span className="text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {selectedElement.type === 'mesa' ? 'Mesa de Cafetería' : 'Locker Inteligente'}
              </span>
              <h4 className="text-sm font-bold text-gray-800 mt-1">
                {selectedElement.type === 'mesa' ? `Mesa N° ${selectedElement.id}` : `Locker N° ${selectedElement.id}`}
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Estado: {' '}
                <strong className={selectedElement.status ? 'text-red-500' : 'text-green-600'}>
                  {selectedElement.status ? (selectedElement.type === 'mesa' ? 'Ocupada' : 'Reservado') : 'Libre'}
                </strong>
              </p>
            </div>

            <button
              onClick={confirmAction}
              className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-colors active-press shadow-sm ${
                selectedElement.status
                  ? 'bg-red-550 hover:bg-red-650 bg-red-500 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-green-100'
              }`}
            >
              {selectedElement.status
                ? (selectedElement.type === 'mesa' ? 'Liberar Mesa' : 'Cancelar Reserva')
                : (selectedElement.type === 'mesa' ? 'Ocupar Mesa' : 'Reservar Locker')}
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <HelpCircle size={14} /> Selecciona un objeto en el mapa para interactuar
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeteriaMap;
