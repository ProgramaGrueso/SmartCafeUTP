import React, { useState } from 'react';
import { ArrowLeft, User, Award, CreditCard, Sparkles, Check, Crown, Trash2 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const Profile: React.FC = () => {
  const { setRoute, user, toggleMembresia } = useAppState();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment gateway loading
    setTimeout(() => {
      toggleMembresia();
      setIsProcessing(false);
      setShowPaymentModal(false);
    }, 1800);
  };

  const mockHistory = [
    { id: 'p001', item: 'Sándwich Express', fecha: 'Hoy, 04:30 p.m.', total: 8.00 },
    { id: 'p002', item: 'Jugo Natural', fecha: 'Ayer, 09:15 a.m.', total: 5.00 },
    { id: 'p003', item: 'Ensalada Saludable', fecha: '14 de Julio, 01:10 p.m.', total: 12.00 },
  ];

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
          <User size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold m-0 leading-tight">Mi Perfil</h2>
          <p className="text-[11px] text-white/80 font-light">Gestión de cuenta y membresía</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 2. User info Card */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border border-gray-200 shrink-0 shadow-inner flex items-center justify-center">
            {/* User Avatar represent */}
            <User size={32} className="text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 leading-tight">{user.nombre}</h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{user.codigo} • {user.carrera}</p>
            <p className="text-[10px] text-gray-400 font-light mt-0.5">Ciclo {user.ciclo} de Sistemas</p>
            
            {user.membresia === 'utp_plus' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full mt-2">
                <Crown size={10} className="fill-purple-400" />
                UTP Plus Premium
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full mt-2">
                Estudiante Regular
              </span>
            )}
          </div>
        </div>

        {/* 3. Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-150 p-3.5 flex flex-col items-center justify-center text-center shadow-xs">
            <Award className="text-[#E86B6B] mb-1" size={24} />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Puntos UTP</span>
            <span className="text-base font-extrabold text-[#E86B6B] mt-0.5">{user.puntos} pts</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-150 p-3.5 flex flex-col items-center justify-center text-center shadow-xs">
            <Sparkles className="text-purple-500 mb-1" size={24} />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nivel Beneficios</span>
            <span className="text-base font-extrabold text-purple-600 mt-0.5">{user.nivel}</span>
          </div>
        </div>

        {/* 4. Membership Upgrade Card */}
        {user.membresia === 'normal' ? (
          <div className="bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white p-4 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-6 translate-x-6" />
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <Crown size={16} className="text-yellow-300 fill-yellow-300 animate-bounce" />
              ¡Actualiza a UTP Plus!
            </h4>
            <p className="text-[11px] text-white/80 font-light mt-1.5 leading-relaxed">
              Desbloquea explicaciones avanzadas de Samira, soporte por voz nativo de IA y 15% de descuento en el Express Menu.
            </p>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="mt-3.5 bg-white text-purple-700 font-bold text-xs px-4 py-2 rounded-xl shadow active-press transition-transform"
            >
              Activar por S/ 9.90 / mes
            </button>
          </div>
        ) : (
          <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-sm space-y-3.5">
            <div className="flex items-center gap-2 text-purple-700">
              <Crown size={20} className="fill-purple-300" />
              <h4 className="text-sm font-bold">¡Tienes Membresía Activa!</h4>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Estás disfrutando al máximo de SmartCafé. Samira te dará consejos de estudio completos y tienes descuentos listos en caja.
            </p>
            <button
              onClick={toggleMembresia}
              className="text-[10px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors active-press py-1"
            >
              <Trash2 size={12} />
              Desactivar membresía de prueba
            </button>
          </div>
        )}

        {/* 5. Order History */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Historial de Pedidos</h4>
          <div className="bg-white border border-gray-150 rounded-2xl divide-y divide-gray-100 overflow-hidden shadow-xs">
            {mockHistory.map((item) => (
              <div key={item.id} className="p-3.5 flex justify-between items-center text-xs">
                <div>
                  <h5 className="font-bold text-gray-800">{item.item}</h5>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.fecha} • Código: {item.id}</p>
                </div>
                <span className="font-bold text-gray-800">S/ {item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credit Card Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden bg-white rounded-2xl shadow-2xl border border-purple-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-yellow-200" />
                <h3 className="font-bold text-sm">Suscribirse a UTP Plus</h3>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-white hover:opacity-80 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePaymentSubmit} className="p-4 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Número de Tarjeta</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <CreditCard size={14} className="text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Expiración</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    placeholder="123"
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center"
                  />
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 flex items-start gap-2.5">
                <Check className="text-purple-600 shrink-0 mt-0.5" size={14} />
                <p className="text-[10px] text-purple-900 leading-normal">
                  Se te cobrará S/ 9.90 mensualmente. Puedes cancelar en cualquier momento desde esta sección sin penalizaciones.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white text-xs font-bold py-2.5 rounded-xl transition-all active-press shadow-md text-center"
              >
                {isProcessing ? 'Procesando pago...' : 'Confirmar Suscripción'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
