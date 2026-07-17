import React, { useState } from 'react';
import { ArrowLeft, CreditCard, ShoppingBag, ShieldCheck, Percent } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const OrderConfirmation: React.FC = () => {
  const { setRoute, pendingProduct, createOrder, user } = useAppState();
  const [paymentMethod, setPaymentMethod] = useState<'utp_card' | 'yape' | 'plin'>('utp_card');

  if (!pendingProduct) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <ShoppingBag size={48} className="text-gray-300" />
        <h3 className="font-bold text-gray-800">No hay producto seleccionado</h3>
        <button
          onClick={() => setRoute('dashboard')}
          className="bg-[#E86B6B] text-white text-xs font-bold px-4 py-2 rounded-xl"
        >
          Volver a Inicio
        </button>
      </div>
    );
  }

  const subtotal = pendingProduct.precio;
  const isPremium = user.membresia === 'utp_plus';
  const discount = isPremium ? subtotal * 0.15 : 0;
  const total = subtotal - discount;

  const handleConfirm = () => {
    createOrder(pendingProduct);
  };

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
          <ShoppingBag size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold m-0 leading-tight">Confirmar Pedido</h2>
          <p className="text-[11px] text-white/80 font-light">Resumen y opciones de pago</p>
        </div>
      </div>

      {/* Main content scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
        {/* Product details */}
        <div className="bg-white rounded-2xl border border-gray-150 p-4 shadow-sm flex items-center gap-3.5">
          <span className="text-3xl" role="img" aria-label={pendingProduct.nombre}>
            {pendingProduct.emoji}
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-800 leading-tight">{pendingProduct.nombre}</h3>
            <p className="text-[10px] text-gray-400 capitalize mt-0.5">{pendingProduct.categoria} • Preparación rápida</p>
            <p className="text-sm font-extrabold text-[#E86B6B] mt-1">S/ {pendingProduct.precio.toFixed(2)}</p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-450">Método de Pago</h4>
          <div className="space-y-2">
            {/* UTP Card */}
            <button
              onClick={() => setPaymentMethod('utp_card')}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all text-left ${
                paymentMethod === 'utp_card'
                  ? 'border-[#E86B6B] bg-red-50/20'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-[#E86B6B]">
                  <CreditCard size={18} />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-800">Tarjeta UTP (Pre-pago)</h5>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">Paga con saldo estudiante UTP</p>
                </div>
              </div>
              <input
                type="radio"
                checked={paymentMethod === 'utp_card'}
                onChange={() => setPaymentMethod('utp_card')}
                className="accent-[#E86B6B]"
              />
            </button>

            {/* Yape */}
            <button
              onClick={() => setPaymentMethod('yape')}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all text-left ${
                paymentMethod === 'yape'
                  ? 'border-purple-600 bg-purple-50/10'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-xs">
                  Y
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-800">Yape</h5>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">Paga directo con tu celular</p>
                </div>
              </div>
              <input
                type="radio"
                checked={paymentMethod === 'yape'}
                onChange={() => setPaymentMethod('yape')}
                className="accent-purple-750 text-purple-600"
              />
            </button>

            {/* Plin */}
            <button
              onClick={() => setPaymentMethod('plin')}
              className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all text-left ${
                paymentMethod === 'plin'
                  ? 'border-cyan-500 bg-cyan-50/10'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-150 text-cyan-600 bg-cyan-50 flex items-center justify-center font-extrabold text-xs">
                  P
                </div>
                <div>
                  <h5 className="text-xs font-bold text-gray-800">Plin</h5>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">Transferencia interbancaria rápida</p>
                </div>
              </div>
              <input
                type="radio"
                checked={paymentMethod === 'plin'}
                onChange={() => setPaymentMethod('plin')}
                className="accent-cyan-500 text-cyan-500"
              />
            </button>
          </div>
        </div>

        {/* Costs Breakdown */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-2.5 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-bold text-gray-800">S/ {subtotal.toFixed(2)}</span>
          </div>

          {isPremium && (
            <div className="flex justify-between text-purple-700">
              <span className="flex items-center gap-1">
                <Percent size={12} />
                Descuento UTP Plus (15%)
              </span>
              <span className="font-bold">-S/ {discount.toFixed(2)}</span>
            </div>
          )}

          <div className="border-t border-gray-100 pt-2.5 flex justify-between text-sm font-extrabold text-gray-850">
            <span className="text-gray-800">Total a pagar</span>
            <span className="text-[#E86B6B] text-base">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Security badge note */}
        <div className="flex items-center gap-2 text-[10px] text-gray-400 justify-center">
          <ShieldCheck size={14} className="text-green-500" />
          <span>Pago 100% seguro con tecnología UTP Connect</span>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-white border-t border-gray-100 p-4 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <button
          onClick={handleConfirm}
          className="w-full bg-[#E86B6B] hover:bg-[#E85757] text-white text-xs font-bold py-3.5 rounded-xl transition-all active-press shadow-lg shadow-red-100 text-center"
        >
          Confirmar y Pagar (S/ {total.toFixed(2)})
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
