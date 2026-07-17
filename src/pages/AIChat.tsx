import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Crown, Send, Coffee, BookOpen, Music, Heart, Sparkles } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import ImageWithFallback from '../components/figma/ImageWithFallback';

export const AIChat: React.FC = () => {
  const { setRoute, chatHistory, addChatMessage, triggerAIResponse } = useAppState();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    addChatMessage(text, true);
    setInputText('');
    setIsTyping(true);

    try {
      // Trigger mockup AI response
      const reply = await triggerAIResponse(text);
      addChatMessage(reply, false);
    } catch (e) {
      console.error(e);
      addChatMessage('Upps, tuve un problema para procesar tu mensaje. ¿Puedes repetirlo? 🥺', false);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    { text: '¿Qué recomiendas hoy?', icon: Coffee },
    { text: 'Tips de estudio', icon: BookOpen },
    { text: 'Música para estudiar', icon: Music },
    { text: 'Solo quiero platicar', icon: Heart },
  ];

  return (
    <div className="flex flex-col flex-1 pb-16 bg-gray-50 h-screen max-h-screen overflow-hidden">
      {/* 1. Header (AI Purple-Pink Gradient) */}
      <div className="bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRoute('dashboard')}
            className="p-1 rounded-full hover:bg-white/10 transition-colors active-press"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/40 bg-purple-100">
              <ImageWithFallback
                src="/samira_avatar.jpg" // Samira avatar
                alt="Samira"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-purple-600 rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-1">
              <h2 className="text-sm font-bold m-0 leading-tight">Samira</h2>
              <Sparkles size={12} className="text-yellow-200 fill-yellow-200" />
            </div>
            <p className="text-[10px] text-white/80 font-light">Tu asistente virtual UTP</p>
          </div>
        </div>

        <button
          onClick={() => setRoute('profile')}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/35 transition-colors px-2.5 py-1 rounded-full border border-white/10 text-white text-[10px] font-bold active-press"
        >
          <Crown size={12} className="text-yellow-300 fill-yellow-300" />
          <span>Premium</span>
        </button>
      </div>

      {/* 2. Message List Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Intro Card - visible only at the top of the conversation */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-3.5 items-start">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-purple-100 shrink-0 border border-purple-200 shadow-inner">
            <ImageWithFallback
              src="/samira_avatar2.jpg" // High fidelity cute anime/illustration style avatar represent
              alt="Samira Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1">
              ¡Conoce a Samira! <span className="text-pink-500">💕</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Estudiante de Ingeniería de Sistemas y tu compañera virtual en SmartCafé. ¡Charlemos mientras disfrutas tu pedido! ✨
            </p>
          </div>
        </div>

        {/* Conversation Bubbles */}
        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-[85%] ${msg.isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            {/* Samira avatar only for bot bubbles */}
            {!msg.isUser && (
              <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 border border-purple-200 shrink-0 shadow-sm mt-0.5">
                <ImageWithFallback
                  src="/samira_avatar.jpg"
                  alt="Samira thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1">
              <div
                className={`p-3 rounded-2xl text-[13px] leading-relaxed shadow-[0_2px_8px_rgba(0,0,0,0.02)] border ${
                  msg.isUser
                    ? 'bg-purple-600 text-white border-transparent rounded-tr-none'
                    : 'bg-white text-gray-800 border-purple-100 rounded-tl-none'
                }`}
              >
                {msg.text.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                ))}
              </div>
              <span className={`text-[9px] text-gray-400 block px-1 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto items-center animate-pulse">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-purple-100 border border-purple-200 shrink-0">
              <ImageWithFallback
                src="/samira_avatar.jpg"
                alt="Samira thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white border border-purple-100 p-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Actions Grid & Input Area */}
      <div className="bg-white border-t border-gray-100 p-3 space-y-3 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10">
        {/* Quick Actions (only show when typing is idle and history is short, say < 6 messages, or show always as a row) */}
        {chatHistory.length <= 6 && !isTyping && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2 px-1">
              Acciones rápidas:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.text}
                    onClick={() => handleSend(action.text)}
                    className="flex items-center gap-2 p-2 text-left bg-purple-50/50 hover:bg-purple-50 border border-purple-100/50 rounded-xl transition-colors active-press"
                  >
                    <Icon size={14} className="text-purple-600 shrink-0" />
                    <span className="text-[11px] text-purple-900 font-medium truncate">{action.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(inputText);
              }}
              placeholder="Escribe un mensaje a Samira..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
            />
          </div>
          
          <button
            onClick={() => handleSend(inputText)}
            className="w-10 h-10 rounded-full bg-[#9333EA] hover:bg-[#812fcb] text-white flex items-center justify-center transition-colors active-press shadow-md shadow-purple-100"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </div>

        {/* Micro-label Footer */}
        <div className="text-center">
          <span className="text-[10px] text-gray-400 font-light">
            Samira · modelo local via ngrok ✨
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
