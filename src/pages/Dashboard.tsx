import React, { useState, useEffect } from 'react';
import { Users, Package, Clock, QrCode, MapPin, MessageSquare, Zap } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import ImageWithFallback from '../components/figma/ImageWithFallback';

export const Dashboard: React.FC = () => {
  const { setRoute, cafeteria, products, setPendingProduct, user } = useAppState();
  const [timeStr, setTimeStr] = useState('');

  // Update clock in real-time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
      hours = hours % 12;
      hours = hours ? hours : 12; // hour '0' should be '12'
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      const strHours = hours < 10 ? '0' + hours : hours;
      setTimeStr(`${strHours}:${strMinutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const productImages: Record<string, string> = {
    m1: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300&auto=format&fit=crop&q=60',
    m2: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=60',
    m3: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&auto=format&fit=crop&q=60',
    m4: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=60',
  };

  const productTimes: Record<string, string> = {
    m1: '3 min',
    m2: '2 min',
    m3: '1 min',
    m4: '10 min',
  };

  return (
    <div className="flex flex-col flex-1 pb-20 overflow-y-auto">
      {/* 1. Header (Red-Coral) */}
      <div className="bg-[#E86B6B] text-white px-4 pt-4 pb-5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#E86B6B] font-extrabold text-sm border-2 border-white/40 shadow-inner">
            SC
          </div>
          <div>
            <h1 className="text-base font-bold m-0 leading-tight tracking-wide">SmartCafé UTP</h1>
            <p className="text-[11px] text-white/80 font-light">Tu asistente inteligente</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-white/70 font-semibold uppercase tracking-wider">Hora actual</p>
          <p className="text-sm font-bold tracking-wide">{timeStr || '06:07 p. m.'}</p>
        </div>
      </div>

      {/* 2. Quick Status Cards */}
      <div className="grid grid-cols-3 gap-3 px-4 -mt-3">
        {/* Aforo / Cola */}
        <div className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 transition-all hover:translate-y-[-2px]">
          <div className="p-1.5 rounded-full bg-red-50 text-[#E86B6B] mb-1">
            <Users size={16} />
          </div>
          <span className="text-[11px] text-gray-400 font-semibold">Cola</span>
          <span className="text-xs font-bold text-green-600">Baja</span>
        </div>

        {/* Stock */}
        <div className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 transition-all hover:translate-y-[-2px]">
          <div className="p-1.5 rounded-full bg-red-50 text-[#E86B6B] mb-1">
            <Package size={16} />
          </div>
          <span className="text-[11px] text-gray-400 font-semibold">Stock</span>
          <span className="text-xs font-bold text-green-600">Disponible</span>
        </div>

        {/* Espera */}
        <div className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 transition-all hover:translate-y-[-2px]">
          <div className="p-1.5 rounded-full bg-red-50 text-[#E86B6B] mb-1">
            <Clock size={16} />
          </div>
          <span className="text-[11px] text-gray-400 font-semibold">Espera</span>
          <span className="text-xs font-bold text-green-600">~{cafeteria.tiempoEspera}</span>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4 flex-1">
        {/* 3. Escanear QR Bar */}
        <button
          onClick={() => setRoute('qr-scan')}
          className="w-full bg-[#E86B6B] hover:bg-[#E85757] text-white p-3.5 rounded-2xl flex items-center justify-between shadow-lg shadow-red-100 transition-all active-press"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2 bg-white/20 rounded-xl border border-white/10">
              <QrCode size={22} className="stroke-[2px]" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold leading-tight">Escanear QR</h3>
              <p className="text-[11px] text-white/80 font-light">Pide desde tu salón</p>
            </div>
          </div>
          <MapPin size={18} className="text-white/80 shrink-0" />
        </button>

        {/* 4. Proactive Chatbot Block */}
        <div
          onClick={() => setRoute('ai-chat')}
          className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          {/* Active Header */}
          <div className="bg-[#E86B6B] px-4 py-2.5 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Asistente Inteligente</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium tracking-wide">Activo</span>
            </div>
          </div>

          {/* Conversations Preview */}
          <div className="p-4 space-y-3 bg-gray-50/50">
            <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100 max-w-[85%] text-left animate-fade-in">
              <p className="text-[13px] text-gray-800 leading-normal">
                ¡Hola! 👋 Soy tu asistente SmartCafé UTP
              </p>
              <span className="text-[9px] text-gray-400 block mt-1 text-right">06:07 p. m.</span>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100 max-w-[85%] text-left animate-fade-in">
              <p className="text-[13px] text-gray-800 leading-normal">
                📍 Te encuentras cerca del Pabellón B. Te quedan 15 min de clase.
              </p>
              <span className="text-[9px] text-gray-400 block mt-1 text-right">06:07 p. m.</span>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-gray-100 max-w-[85%] text-left animate-fade-in">
              <p className="text-[13px] text-gray-800 leading-normal font-medium">
                ¿Quieres que tu pedido esté listo al salir? Puedes escanear el QR desde el salón 🎯
              </p>
              <span className="text-[9px] text-gray-400 block mt-1 text-right">06:07 p. m.</span>
            </div>
          </div>

          <div className="bg-white py-2 px-4 border-t border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 font-light">
              El asistente sugiere opciones basadas en tu horario y preferencias
            </span>
          </div>
        </div>

        {/* 5. Express Menu Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 text-[#E86B6B]">
              <Zap size={18} className="fill-[#E86B6B]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">Express Menu</h2>
            </div>
            <span className="text-[10px] font-semibold bg-red-100 text-[#E86B6B] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Preparación rápida
            </span>
          </div>

          {/* List of Products (Vertical cards matching Image 1) */}
          <div className="space-y-3">
            {products.map((product) => {
              const imgUrl = productImages[product.id] || '';
              const time = productTimes[product.id] || '3 min';
              const isAvailable = product.cantidad > 0;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl border border-gray-200 p-3 flex items-center justify-between shadow-sm transition-all hover:shadow-md ${
                    !isAvailable ? 'opacity-65' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                      <ImageWithFallback
                        src={imgUrl}
                        alt={product.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-800 leading-tight">{product.nombre}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                          <Clock size={10} />
                          {time}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {isAvailable ? `Quedan ${product.cantidad} porciones` : 'Agotado'}
                        </span>
                      </div>
                      <span className="text-[13px] font-extrabold text-[#E86B6B] block mt-1">
                        S/ {product.precio.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (isAvailable) {
                        setPendingProduct(product);
                        setRoute('order-confirmation');
                      }
                    }}
                    disabled={!isAvailable}
                    className={`px-4 py-2 text-xs font-bold rounded-xl active-press transition-colors shadow-sm ${
                      isAvailable
                        ? 'bg-[#E86B6B] hover:bg-[#E85757] text-white shadow-red-100'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? 'Ordenar' : 'Agotado'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Premium Samira Promotion Banner */}
        <div
          onClick={() => setRoute('profile')}
          className="bg-gradient-to-r from-[#9333EA] to-[#EC4899] p-3.5 rounded-2xl text-white shadow-xl shadow-purple-100 flex items-center justify-between relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform active-press"
        >
          {/* Subtle background graphic */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-6 translate-x-6" />

          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/60 shadow-md">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60" // Placeholder for Samira avatar
                  alt="Samira"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-purple-600 flex items-center justify-center text-[8px]">
                ⭐
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-extrabold tracking-wider bg-white/20 px-1.5 py-0.5 rounded-md border border-white/10">
                  Premium
                </span>
              </div>
              <h4 className="text-[13px] font-bold mt-0.5">Chatea con Samira Premium ✨</h4>
              <p className="text-[10px] text-white/80 font-light">Asesoría de tareas, voz y más</p>
            </div>
          </div>

          <div className="bg-white text-purple-700 font-extrabold text-[10px] px-3 py-1.5 rounded-lg shadow-md shrink-0">
            {user.membresia === 'utp_plus' ? 'Ver Beneficios' : 'Ver Plus'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
