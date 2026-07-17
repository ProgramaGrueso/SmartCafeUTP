import React, { useState } from 'react';
import { Star, Heart, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const Feedback: React.FC = () => {
  const { setRoute, cancelOrder } = useAppState();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      // Clear the active order and return to dashboard
      cancelOrder();
      setRoute('dashboard');
    }, 2000);
  };

  return (
    <div className="flex flex-col flex-1 pb-16 bg-gray-50 h-screen max-h-screen overflow-hidden justify-between">
      {/* Header */}
      <div className="bg-[#E86B6B] text-white px-4 py-4 flex items-center gap-3 shadow-md shrink-0">
        <div className="p-2 bg-white/20 rounded-full border border-white/10 shrink-0">
          <Heart size={20} className="fill-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold m-0 leading-tight">Califica tu Experiencia</h2>
          <p className="text-[11px] text-white/80 font-light">Ayúdanos a mejorar el servicio express</p>
        </div>
      </div>

      {/* Main Form content */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-center items-center text-center">
        {submitted ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-200">
            <CheckCircle2 size={56} className="text-green-500 mx-auto fill-green-50" />
            <h3 className="font-extrabold text-gray-800 text-lg">¡Muchas gracias por tu calificación!</h3>
            <p className="text-xs text-gray-400 max-w-xs">
              Tus comentarios ayudan a que el servicio express de SmartCafé UTP sea cada vez más rápido y eficiente.
            </p>
            <span className="text-[10px] text-purple-600 font-extrabold bg-purple-50 border border-purple-100 px-3 py-1 rounded-full inline-block animate-pulse">
              🎉 ¡Ganaste +10 Puntos UTP!
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-gray-800">¿Qué tan rápido y sabroso estuvo tu pedido?</h4>
              <p className="text-xs text-gray-400">Califica con estrellas a SmartCafé UTP</p>
            </div>

            {/* Stars Selector */}
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = hoverRating !== null ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform hover:scale-125 active-press"
                  >
                    <Star
                      size={32}
                      className={`transition-colors stroke-[1.5px] ${
                        active
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Feedback Comment box */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase">¿Tienes algún comentario o sugerencia?</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe aquí... (Ej: El sandwich estaba calientito y el recojo fue inmediato)"
                rows={4}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E86B6B] hover:bg-[#E85757] text-white text-xs font-bold py-3.5 rounded-xl transition-all active-press shadow-lg shadow-red-100"
            >
              Enviar Calificación
            </button>
          </form>
        )}
      </div>

      {/* Spacer footer */}
      <div className="py-2 bg-gray-50 text-center shrink-0 border-t border-gray-100">
        <span className="text-[10px] text-gray-400 font-light">
          SmartCafé UTP • Calificación Express
        </span>
      </div>
    </div>
  );
};

export default Feedback;
