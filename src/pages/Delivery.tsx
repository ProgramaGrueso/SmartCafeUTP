import React, { useState } from 'react';
import { ArrowLeft, Bike, Bell, Package, Check, MapPin, User, Timer } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const Delivery: React.FC = () => {
  const { setRoute, deliveryRequests, acceptDelivery, addDeliveryRequest } = useAppState();
  const [wantsToDeliver, setWantsToDeliver] = useState(false);
  const [wantsToOrder, setWantsToOrder] = useState(false);

  // Form states for publishing
  const [itemText, setItemText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [rewardText, setRewardText] = useState('S/ 2.00');
  const [justPublished, setJustPublished] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemText.trim() || !destinationText.trim() || !rewardText.trim()) return;

    addDeliveryRequest(itemText, destinationText, rewardText);
    setItemText('');
    setDestinationText('');
    setRewardText('S/ 2.00');
    setJustPublished(true);
    setTimeout(() => setJustPublished(false), 3000);
  };

  return (
    <div className="flex flex-col flex-1 pb-20 overflow-y-auto">
      {/* 1. Header (Red-Coral with Bike) */}
      <div className="bg-[#E86B6B] text-white px-4 py-4 flex items-center gap-3 shadow-md shrink-0">
        <button
          onClick={() => setRoute('dashboard')}
          className="p-1 rounded-full hover:bg-white/10 transition-colors active-press"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="p-2 bg-white/20 rounded-full border border-white/10 shrink-0">
          <Bike size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold m-0 leading-tight">SmartDelivery</h2>
          <p className="text-[11px] text-white/80 font-light">Pedidos entre estudiantes UTP</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 2. Switch Toggle Card 1: Quiero Repartir */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-orange-50 text-orange-500 rounded-2xl shrink-0">
              <Bell size={20} className="stroke-[2.5px]" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-800 leading-tight">Quiero repartir</h3>
              <p className="text-[11px] text-gray-400 font-light mt-0.5">Recibe avisos cuando alguien publique un pedido</p>
            </div>
          </div>
          
          {/* Custom Switch Toggle */}
          <button
            onClick={() => {
              setWantsToDeliver(!wantsToDeliver);
              if (!wantsToDeliver) setWantsToOrder(false); // mutually exclusive or stackable? Lets make it toggleable nicely
            }}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 relative ${
              wantsToDeliver ? 'bg-[#E86B6B]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                wantsToDeliver ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Switch Toggle Card 2: Publicar mi pedido */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-purple-50 text-[#A855F7] rounded-2xl shrink-0">
              <Package size={20} className="stroke-[2.5px]" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-800 leading-tight">Publicar mi pedido</h3>
              <p className="text-[11px] text-gray-400 font-light mt-0.5">Pide a otro estudiante que te traiga algo</p>
            </div>
          </div>
          
          {/* Custom Switch Toggle */}
          <button
            onClick={() => {
              setWantsToOrder(!wantsToOrder);
              if (!wantsToOrder) setWantsToDeliver(false);
            }}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 relative ${
              wantsToOrder ? 'bg-[#E86B6B]' : 'bg-gray-300'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                wantsToOrder ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 4. Dynamic Content Area */}

        {/* Case A: Both toggles are OFF */}
        {!wantsToDeliver && !wantsToOrder && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
            <Bike size={52} className="text-gray-300 stroke-[1.2px]" />
            <p className="text-xs text-gray-400 font-medium">Activa una opción para comenzar</p>
          </div>
        )}

        {/* Case B: "Quiero repartir" is ON */}
        {wantsToDeliver && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Pedidos Disponibles</h4>
              <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">En tiempo real</span>
            </div>

            {deliveryRequests.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">No hay solicitudes pendientes en este momento.</p>
            ) : (
              <div className="space-y-3">
                {deliveryRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`bg-white rounded-2xl border border-gray-150 p-4 shadow-sm relative overflow-hidden transition-all ${
                      req.estado !== 'disponible' ? 'border-l-4 border-l-green-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[13px] font-bold text-gray-800 leading-tight">{req.item}</h4>
                        <div className="flex flex-col gap-1 mt-2 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-[#E86B6B]" />
                            Destino: <strong className="text-gray-700">{req.destino}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={12} className="text-gray-400" />
                            Usuario: {req.autor}
                          </span>
                          <span className="flex items-center gap-1">
                            <Timer size={12} className="text-gray-400" />
                            Tiempo estimado: {req.tiempoEstimado}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2.5">
                        <span className="text-[13px] font-extrabold text-[#E86B6B] block">
                          Recompensa: {req.recompensa}
                        </span>
                        
                        {req.estado === 'disponible' && (
                          <button
                            onClick={() => acceptDelivery(req.id)}
                            className="bg-[#E86B6B] hover:bg-[#E85757] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors active-press shadow-sm shadow-red-100"
                          >
                            Aceptar Pedido
                          </button>
                        )}
                        
                        {req.estado === 'aceptado' && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                            🚲 En progreso...
                          </span>
                        )}

                        {req.estado === 'entregado' && (
                          <span className="text-[10px] font-bold bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <Check size={12} />
                            Entregado (+150 pts)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Case C: "Publicar mi pedido" is ON */}
        {wantsToOrder && (
          <div className="space-y-4 animate-fade-in">
            {/* Publication Form */}
            <form onSubmit={handlePublish} className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">Publicar una solicitud</h4>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">¿Qué necesitas de la cafetería?</label>
                <input
                  type="text"
                  required
                  value={itemText}
                  onChange={(e) => setItemText(e.target.value)}
                  placeholder="Ej: Jugo de fresa + sándwich de pollo"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">¿Dónde te encuentras?</label>
                  <input
                    type="text"
                    required
                    value={destinationText}
                    onChange={(e) => setDestinationText(e.target.value)}
                    placeholder="Ej: Aula B-402"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Recompensa</label>
                  <input
                    type="text"
                    required
                    value={rewardText}
                    onChange={(e) => setRewardText(e.target.value)}
                    placeholder="Ej: S/ 2.00"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E86B6B] hover:bg-[#E85757] text-white text-xs font-bold py-2.5 rounded-xl transition-colors active-press shadow-sm"
              >
                Publicar Pedido
              </button>

              {justPublished && (
                <div className="bg-green-50 text-green-700 text-xs py-2 rounded-xl text-center border border-green-100 flex items-center justify-center gap-1.5">
                  <Check size={14} className="stroke-[2.5px]" /> Solicitud publicada con éxito
                </div>
              )}
            </form>

            {/* User Requests List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Mis Solicitudes</h4>
              {deliveryRequests.filter(r => r.autor === 'Ana García').length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 border border-dashed rounded-xl">No has publicado ningún pedido todavía.</p>
              ) : (
                <div className="space-y-2">
                  {deliveryRequests.filter(r => r.autor === 'Ana García').map(req => (
                    <div key={req.id} className="bg-white rounded-xl border border-gray-200 p-3 flex justify-between items-center shadow-xs">
                      <div>
                        <h5 className="text-[12px] font-bold text-gray-800">{req.item}</h5>
                        <p className="text-[10px] text-gray-400 mt-0.5">Destino: {req.destino} • Pago: {req.recompensa}</p>
                      </div>
                      <div>
                        {req.estado === 'disponible' && (
                          <span className="text-[9px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            Esperando repartidor
                          </span>
                        )}
                        {req.estado === 'aceptado' && (
                          <span className="text-[9px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full animate-pulse">
                            Aceptado por compañero
                          </span>
                        )}
                        {req.estado === 'entregado' && (
                          <span className="text-[9px] font-semibold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                            ✓ Entregado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Delivery;
