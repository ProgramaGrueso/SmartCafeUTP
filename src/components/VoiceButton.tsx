import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, X, ChevronRight } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import type { Product } from '../context/AppStateContext';

export const VoiceButton: React.FC = () => {
  const { setRoute, createOrder, products, addChatMessage, triggerAIResponse } = useAppState();
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [showSimModal, setShowSimModal] = useState(false);
  const [simText, setSimText] = useState('');
  const [statusMessage, setStatusMessage] = useState('Presiona para hablar');
  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'es-PE';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setStatusMessage('Escuchando...');
      speakTTS('Te escucho');
    };

    rec.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log('Voice Command Received:', transcript);
      handleCommand(transcript);
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setStatusMessage('Permiso denegado. Abriendo simulador...');
        setTimeout(() => {
          setShowSimModal(true);
        }, 1000);
      } else {
        setStatusMessage('Error al escuchar. Reintenta.');
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
  }, []);

  const speakTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-LA'; // Latin American Spanish if possible
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.includes('es-') || v.lang.includes('es_'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCommand = (command: string) => {
    const text = command.toLowerCase().trim();
    setStatusMessage(`Entendido: "${text}"`);

    // 1. Navigation Commands
    if (text.includes('inicio') || text.includes('dashboard') || text.includes('home')) {
      speakTTS('Abriendo pantalla de inicio.');
      setRoute('dashboard');
      setShowSimModal(false);
      return;
    }
    if (text.includes('samira') || text.includes('chat') || text.includes('hablar con samira') || text.includes('asistente')) {
      speakTTS('Conectando con Samira.');
      setRoute('ai-chat');
      setShowSimModal(false);
      return;
    }
    if (text.includes('mapa') || text.includes('ubicación') || text.includes('cafetería')) {
      speakTTS('Abriendo el mapa de la cafetería.');
      setRoute('map');
      setShowSimModal(false);
      return;
    }
    if (text.includes('stock') || text.includes('inventario') || text.includes('disponible')) {
      speakTTS('Mostrando el estado de stock.');
      setRoute('stock');
      setShowSimModal(false);
      return;
    }
    if (text.includes('delivery') || text.includes('reparto') || text.includes('repartir')) {
      speakTTS('Abriendo pedidos de delivery.');
      setRoute('delivery');
      setShowSimModal(false);
      return;
    }
    if (text.includes('perfil') || text.includes('usuario') || text.includes('mi cuenta') || text.includes('puntos')) {
      speakTTS('Abriendo tu perfil.');
      setRoute('profile');
      setShowSimModal(false);
      return;
    }
    if (text.includes('escanear') || text.includes('qr') || text.includes('lector')) {
      speakTTS('Abriendo escáner QR.');
      setRoute('qr-scan');
      setShowSimModal(false);
      return;
    }

    // 2. Ordering Commands (e.g., "ordenar sandwich", "quiero café")
    if (text.includes('ordenar') || text.includes('pedir') || text.includes('comprar') || text.includes('quiero')) {
      let targetProduct: Product | undefined;
      if (text.includes('sandwich') || text.includes('sándwich')) {
        targetProduct = products.find(p => p.id === 'm1');
      } else if (text.includes('ensalada')) {
        targetProduct = products.find(p => p.id === 'm2');
      } else if (text.includes('jugo')) {
        targetProduct = products.find(p => p.id === 'm3');
      } else if (text.includes('menú') || text.includes('menu')) {
        targetProduct = products.find(p => p.id === 'm4');
      }

      if (targetProduct) {
        if (targetProduct.cantidad > 0) {
          speakTTS(`Confirmando orden de ${targetProduct.nombre}.`);
          createOrder(targetProduct);
          setShowSimModal(false);
        } else {
          speakTTS(`Lo siento, el producto ${targetProduct.nombre} está agotado por el momento.`);
          setStatusMessage(`${targetProduct.nombre} agotado`);
        }
      } else {
        speakTTS('¿Qué producto te gustaría ordenar? Puedes pedir sándwich, ensalada o jugo.');
        setStatusMessage('Producto no reconocido');
      }
      return;
    }

    // 3. Conversation Commands (directly feed into Samira chat if we're on Samira route, or suggest navigating)
    speakTTS(`Preguntando a Samira: ${text}`);
    addChatMessage(command, true);
    triggerAIResponse(command).then(reply => {
      addChatMessage(reply, false);
      speakTTS(reply.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '')); // strip emojis for smoother speech
    });
    setRoute('ai-chat');
    setShowSimModal(false);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error(e);
          // Fallback if already running or crashed
          setShowSimModal(true);
        }
      } else {
        setShowSimModal(true);
      }
    }
  };

  const sampleCommands = [
    'Ir a Samira',
    'Ver Stock',
    'Ordenar Sándwich',
    'Mostrar Mapa',
    'Ir a Delivery',
    'Escanear QR',
    '¿Qué recomiendas hoy?'
  ];

  return (
    <>
      {/* Listening Glow Rings (only active when listening) */}
      {isListening && (
        <div className="fixed bottom-24 right-5 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-[#E86B6B] rounded-full voice-ripple-1 w-14 h-14 -translate-x-0 -translate-y-0" />
          <div className="absolute inset-0 bg-[#EC4899] rounded-full voice-ripple-2 w-14 h-14 -translate-x-0 -translate-y-0" />
          <div className="absolute inset-0 bg-[#9333EA] rounded-full voice-ripple-3 w-14 h-14 -translate-x-0 -translate-y-0" />
        </div>
      )}

      {/* Main floating action button */}
      <button
        onClick={toggleListening}
        className={`fixed bottom-24 right-5 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-[0_8px_30px_rgb(232,107,107,0.3)] transition-all duration-300 active-press ${
          isListening
            ? 'bg-red-600 text-white'
            : 'bg-gradient-to-tr from-[#E86B6B] via-[#EC4899] to-[#9333EA] text-white hover:scale-110'
        }`}
        title={speechSupported ? 'Asistente de voz' : 'Simulador de voz premium'}
      >
        {isListening ? (
          <MicOff size={24} className="animate-pulse" />
        ) : (
          <Mic size={24} />
        )}
      </button>

      {/* Simulator Modal for Unsupported Browsers / Blocked Permissions */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden bg-white rounded-2xl shadow-2xl border border-purple-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-200 animate-spin-slow" />
                <h3 className="font-bold text-sm">Asistente por Voz Inteligente</h3>
              </div>
              <button
                onClick={() => setShowSimModal(false)}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                {speechSupported 
                  ? 'Tu navegador soporta voz, pero también puedes usar este simulador rápido:' 
                  : 'El reconocimiento de voz nativo requiere HTTPS/Chrome. ¡Usa este simulador por voz premium para probar todos los comandos!'}
              </p>

              {/* Input for simulator */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (simText.trim()) {
                    handleCommand(simText);
                    setSimText('');
                  }
                }}
                className="flex gap-2 mb-4"
              >
                <input
                  type="text"
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  placeholder='Prueba: "ir a stock" o "ordenar sandwich"'
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors active-press"
                >
                  <ChevronRight size={18} />
                </button>
              </form>

              {/* Suggestions */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Comandos de ejemplo:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {sampleCommands.map((cmd) => (
                    <button
                      key={cmd}
                      onClick={() => handleCommand(cmd)}
                      className="px-2.5 py-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 rounded-full transition-all text-left flex items-center gap-1 active-press"
                    >
                      <Volume2 size={12} className="text-purple-400" />
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer status */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 font-medium">
                {statusMessage}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceButton;
