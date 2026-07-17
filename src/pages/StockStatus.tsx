import React, { useState } from 'react';
import { ArrowLeft, Users, Package, HelpCircle } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const StockStatus: React.FC = () => {
  const { setRoute, cafeteria, products, lockers } = useAppState();
  const [filterCategory, setFilterCategory] = useState<'todo' | 'bebida' | 'comida'>('todo');

  const filteredProducts = products.filter((p) => {
    if (filterCategory === 'todo') return true;
    return p.categoria === filterCategory;
  });

  const availableLockers = lockers.filter(l => !l.reservado).length;

  // Compute aforo details
  const aforoPercent = (cafeteria.aforoActual / cafeteria.aforoMaximo) * 100;
  let aforoColor = 'bg-green-500';
  let aforoTextColor = 'text-green-600';
  let aforoLabel = 'Bajo';

  if (aforoPercent > 75) {
    aforoColor = 'bg-red-500';
    aforoTextColor = 'text-red-600';
    aforoLabel = 'Saturado';
  } else if (aforoPercent > 45) {
    aforoColor = 'bg-orange-500';
    aforoTextColor = 'text-orange-500';
    aforoLabel = 'Moderado';
  }

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
          <Package size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold m-0 leading-tight">Estado del Stock</h2>
          <p className="text-[11px] text-white/80 font-light">Inventario y ocupación en vivo</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 2. Aforo Card (Ocupación en vivo) */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm space-y-3.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Aforo Cafetería</h4>
            </div>
            <span className={`text-xs font-extrabold ${aforoTextColor}`}>
              {aforoLabel} ({cafeteria.aforoActual} / {cafeteria.aforoMaximo})
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full ${aforoColor} transition-all duration-500`}
              style={{ width: `${aforoPercent}%` }}
            />
          </div>

          {/* Additional details */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 border-t border-gray-50 pt-2.5">
            <div>
              Lockers libres:{' '}
              <strong className="text-gray-700 font-bold">
                {availableLockers} de {lockers.length}
              </strong>
            </div>
            <div className="text-right">
              Tiempo espera: <strong className="text-gray-700 font-bold">{cafeteria.tiempoEspera}</strong>
            </div>
          </div>
        </div>

        {/* 3. Category Filter Tabs */}
        <div className="flex bg-white p-1 rounded-xl border border-gray-200">
          {(['todo', 'bebida', 'comida'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all capitalize active-press ${
                filterCategory === cat
                  ? 'bg-[#E86B6B] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {cat === 'todo' ? 'Todos' : cat === 'bebida' ? 'Bebidas' : 'Comidas'}
            </button>
          ))}
        </div>

        {/* 4. Product Stock Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((p) => {
            const hasStock = p.cantidad > 0;
            const isLow = p.cantidad > 0 && p.cantidad <= 5;
            
            let statusLabel = 'Disponible';
            let badgeBg = 'bg-green-50 text-green-600 border-green-100';
            
            if (!hasStock) {
              statusLabel = 'Agotado';
              badgeBg = 'bg-red-50 text-red-600 border-red-100';
            } else if (isLow) {
              statusLabel = `Quedan ${p.cantidad}`;
              badgeBg = 'bg-orange-50 text-orange-600 border-orange-100';
            }

            return (
              <div
                key={p.id}
                className={`bg-white border border-gray-150 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md hover:translate-y-[-1px] ${
                  !hasStock ? 'bg-gray-50/50' : ''
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-2xl" role="img" aria-label={p.nombre}>
                      {p.emoji}
                    </span>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <h5 className="text-[13px] font-bold text-gray-800 mt-3.5 leading-tight">{p.nombre}</h5>
                  <p className="text-[10px] text-gray-400 capitalize mt-0.5">{p.categoria}</p>
                </div>

                <div className="flex justify-between items-baseline mt-4 pt-2 border-t border-gray-50">
                  <span className="text-[10px] text-gray-400 font-semibold">Precio:</span>
                  <span className="text-sm font-extrabold text-[#E86B6B]">
                    S/ {p.precio.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Update Timestamp caption */}
        <div className="text-center pt-2 flex items-center justify-center gap-1">
          <HelpCircle size={12} className="text-gray-400" />
          <span className="text-[10px] text-gray-400 font-light">
            Última actualización: hace un momento
          </span>
        </div>
      </div>
    </div>
  );
};

export default StockStatus;
