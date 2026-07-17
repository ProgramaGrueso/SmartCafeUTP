import React, { createContext, useContext, useState, useEffect } from 'react';

export type RouteType =
  | 'dashboard'
  | 'ai-chat'
  | 'map'
  | 'stock'
  | 'delivery'
  | 'profile'
  | 'qr-scan'
  | 'order-confirmation'
  | 'order-tracking'
  | 'feedback';

export interface User {
  nombre: string;
  codigo: string;
  carrera: string;
  ciclo: number;
  membresia: 'normal' | 'utp_plus';
  puntos: number;
  nivel: string;
}

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  disponible: boolean;
  categoria: 'bebida' | 'comida';
  emoji: string;
}

export interface Order {
  id: string;
  item: Product;
  precio: number;
  estado: 'received' | 'preparing' | 'ready' | 'completed';
  tiempoRestante: number; // en segundos
}

export interface DeliveryRequest {
  id: number;
  item: string;
  destino: string;
  recompensa: string;
  tiempoEstimado: string;
  autor: string;
  estado: 'disponible' | 'aceptado' | 'entregado';
}

export interface Locker {
  id: number;
  reservado: boolean;
}

export interface Mesa {
  id: number;
  ocupada: boolean;
}

export interface CafeteriaState {
  aforoActual: number;
  aforoMaximo: number;
  tiempoEspera: string;
}

interface AppStateContextProps {
  currentRoute: RouteType;
  setRoute: (route: RouteType) => void;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  toggleMembresia: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  activeOrder: Order | null;
  setActiveOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  createOrder: (product: Product) => void;
  advanceOrder: () => void;
  cancelOrder: () => void;
  deliveryRequests: DeliveryRequest[];
  setDeliveryRequests: React.Dispatch<React.SetStateAction<DeliveryRequest[]>>;
  acceptDelivery: (id: number) => void;
  addDeliveryRequest: (item: string, destino: string, recompensa: string) => void;
  lockers: Locker[];
  toggleLocker: (id: number) => void;
  mesas: Mesa[];
  toggleMesa: (id: number) => void;
  cafeteria: CafeteriaState;
  triggerAIResponse: (userMessage: string) => Promise<string>;
  chatHistory: Array<{ id: number; text: string; isUser: boolean; timestamp: string }>;
  setChatHistory: React.Dispatch<React.SetStateAction<Array<{ id: number; text: string; isUser: boolean; timestamp: string }>>>;
  addChatMessage: (text: string, isUser: boolean) => void;
  pendingProduct: Product | null;
  setPendingProduct: React.Dispatch<React.SetStateAction<Product | null>>;
}

const AppStateContext = createContext<AppStateContextProps | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setRoute] = useState<RouteType>('dashboard');
  const [user, setUser] = useState<User>({
    nombre: 'Ana García',
    codigo: 'U20231234',
    carrera: 'Ing. de Sistemas',
    ciclo: 6,
    membresia: 'normal',
    puntos: 1240,
    nivel: 'Gold',
  });

  const [products, setProducts] = useState<Product[]>([
    { id: 'm1', nombre: 'Sándwich Express', precio: 8.00, cantidad: 5, disponible: true, categoria: 'comida', emoji: '🥪' },
    { id: 'm2', nombre: 'Ensalada Saludable', precio: 12.00, cantidad: 3, disponible: true, categoria: 'comida', emoji: '🥗' },
    { id: 'm3', nombre: 'Jugo Natural', precio: 5.00, cantidad: 8, disponible: true, categoria: 'bebida', emoji: '🥤' },
    { id: 'm4', nombre: 'Menú del Día', precio: 9.00, cantidad: 0, disponible: false, categoria: 'comida', emoji: '🍱' },
  ]);

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([
    { id: 1, item: 'Café americano + sándwich', destino: 'Aula B-304', recompensa: 'S/ 2.00', tiempoEstimado: '10 min', autor: 'Carlos R.', estado: 'disponible' },
    { id: 2, item: 'Ensalada de frutas', destino: 'Laboratorio L-12', recompensa: 'S/ 3.50', tiempoEstimado: '15 min', autor: 'Sofía M.', estado: 'disponible' },
    { id: 3, item: 'Empanada + Coca Cola', destino: 'Pabellón A - Piso 4', recompensa: 'S/ 1.50', tiempoEstimado: '8 min', autor: 'Diego T.', estado: 'disponible' },
  ]);

  const [lockers, setLockers] = useState<Locker[]>([
    { id: 1, reservado: false },
    { id: 2, reservado: true },
    { id: 3, reservado: false },
    { id: 4, reservado: false },
    { id: 5, reservado: true },
    { id: 6, reservado: false },
    { id: 7, reservado: false },
    { id: 8, reservado: false },
    { id: 9, reservado: true },
    { id: 10, reservado: false },
  ]);

  const [mesas, setMesas] = useState<Mesa[]>([
    { id: 1, ocupada: false },
    { id: 2, ocupada: true },
    { id: 3, ocupada: false },
    { id: 4, ocupada: true },
    { id: 5, ocupada: false },
    { id: 6, ocupada: false },
    { id: 7, ocupada: false },
    { id: 8, ocupada: true },
    { id: 9, ocupada: false },
    { id: 10, ocupada: false },
    { id: 11, ocupada: false },
    { id: 12, ocupada: true },
  ]);

  const [cafeteria, setCafeteria] = useState<CafeteriaState>({
    aforoActual: 34,
    aforoMaximo: 60,
    tiempoEspera: '4 min',
  });

  // Chat History
  const [chatHistory, setChatHistory] = useState<Array<{ id: number; text: string; isUser: boolean; timestamp: string }>>([
    {
      id: 1,
      text: '¡Hola! Soy Samira, tu asistente virtual de SmartCafé UTP 😊',
      isUser: false,
      timestamp: '06:07 p. m.',
    },
    {
      id: 2,
      text: '¿Cómo va tu día en la UTP? Estoy aquí para hacerte compañía mientras esperas tu pedido ✨',
      isUser: false,
      timestamp: '06:07 p. m.',
    },
  ]);

  // Simulate cafeteria aforo fluctuations slightly
  useEffect(() => {
    const interval = setInterval(() => {
      setCafeteria((prev) => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const nextAforo = Math.max(10, Math.min(prev.aforoMaximo, prev.aforoActual + change));
        return {
          ...prev,
          aforoActual: nextAforo,
          tiempoEspera: nextAforo > 45 ? '12 min' : nextAforo > 30 ? '5 min' : '2 min',
        };
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Simulate active order progression
  useEffect(() => {
    if (!activeOrder) return;

    if (activeOrder.tiempoRestante <= 0) {
      if (activeOrder.estado === 'received') {
        setActiveOrder((prev) => prev ? { ...prev, estado: 'preparing', tiempoRestante: 10 } : null);
      } else if (activeOrder.estado === 'preparing') {
        setActiveOrder((prev) => prev ? { ...prev, estado: 'ready', tiempoRestante: 15 } : null);
      }
      return;
    }

    const timer = setTimeout(() => {
      setActiveOrder((prev) => prev ? { ...prev, tiempoRestante: prev.tiempoRestante - 1 } : null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeOrder]);

  const toggleMembresia = () => {
    setUser((prev) => ({
      ...prev,
      membresia: prev.membresia === 'normal' ? 'utp_plus' : 'normal',
      puntos: prev.membresia === 'normal' ? prev.puntos + 500 : prev.puntos, // Bonus points on premium upgrade
    }));
  };

  const createOrder = (product: Product) => {
    // Decrease stock immediately
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === product.id) {
          const newQty = Math.max(0, p.cantidad - 1);
          return {
            ...p,
            cantidad: newQty,
            disponible: newQty > 0,
          };
        }
        return p;
      })
    );

    setActiveOrder({
      id: `ORD-${Date.now().toString().slice(-6)}`,
      item: product,
      precio: product.precio,
      estado: 'received',
      tiempoRestante: 5, // 5 seconds in 'received', then transitions
    });
    setRoute('order-tracking');
  };

  const advanceOrder = () => {
    if (!activeOrder) return;
    if (activeOrder.estado === 'received') {
      setActiveOrder({ ...activeOrder, estado: 'preparing', tiempoRestante: 10 });
    } else if (activeOrder.estado === 'preparing') {
      setActiveOrder({ ...activeOrder, estado: 'ready', tiempoRestante: 0 });
    } else if (activeOrder.estado === 'ready') {
      setActiveOrder({ ...activeOrder, estado: 'completed', tiempoRestante: 0 });
      // Add points to user
      setUser(prev => ({
        ...prev,
        puntos: prev.puntos + Math.round(activeOrder.precio * 10)
      }));
      setRoute('feedback');
    }
  };

  const cancelOrder = () => {
    // Restore stock
    if (activeOrder) {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === activeOrder.item.id) {
            return {
              ...p,
              cantidad: p.cantidad + 1,
              disponible: true,
            };
          }
          return p;
        })
      );
    }
    setActiveOrder(null);
    setRoute('dashboard');
  };

  const acceptDelivery = (id: number) => {
    setDeliveryRequests((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: 'aceptado' } : d))
    );
    // Add points/reward to student profile dynamically after simulation
    setTimeout(() => {
      setDeliveryRequests((prev) =>
        prev.map((d) => (d.id === id ? { ...d, estado: 'entregado' } : d))
      );
      // Give points to user for completing a delivery
      setUser((prev) => ({
        ...prev,
        puntos: prev.puntos + 150,
      }));
    }, 8000);
  };

  const addDeliveryRequest = (item: string, destino: string, recompensa: string) => {
    const newReq: DeliveryRequest = {
      id: Date.now(),
      item,
      destino,
      recompensa,
      tiempoEstimado: '10 min',
      autor: user.nombre,
      estado: 'disponible',
    };
    setDeliveryRequests((prev) => [newReq, ...prev]);
  };

  const toggleLocker = (id: number) => {
    setLockers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, reservado: !l.reservado } : l))
    );
  };

  const toggleMesa = (id: number) => {
    setMesas((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ocupada: !m.ocupada } : m))
    );
  };

  const formatTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    const strHours = hours < 10 ? '0' + hours : hours;
    return `${strHours}:${strMinutes} ${ampm}`;
  };

  const addChatMessage = (text: string, isUser: boolean) => {
    setChatHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        isUser,
        timestamp: formatTime(),
      },
    ]);
  };

  const triggerAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const formattedMessages = chatHistory.map((msg) => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
      }));
      formattedMessages.push({ role: 'user', content: userMessage });

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }
      throw new Error('Respuesta inválida del servidor proxy.');
    } catch (error) {
      console.warn('Conexión con micro-backend fallida. Usando simulación local:', error);
      
      const cleanMsg = userMessage.toLowerCase().trim();
      let response = '';

      if (cleanMsg.includes('hola') || cleanMsg.includes('buenos dias') || cleanMsg.includes('buenas tardes')) {
        response = `¡Hola, ${user.nombre}! ¿Qué te gustaría ordenar hoy? Tenemos un menú express delicioso esperándote. ☕🥐`;
      } else if (cleanMsg.includes('disponible') || cleanMsg.includes('menu') || cleanMsg.includes('comida') || cleanMsg.includes('stock')) {
        const itemsList = products
          .map((p) => `${p.emoji} ${p.nombre} (S/ ${p.precio.toFixed(2)}) - ${p.cantidad > 0 ? `Quedan ${p.cantidad}` : 'Agotado'}`)
          .join('\n');
        response = `Esto es lo que tenemos en stock ahora:\n${itemsList}\n\n¿Quieres ordenar algo?`;
      } else if (cleanMsg.includes('premium') || cleanMsg.includes('utp plus') || cleanMsg.includes('plus')) {
        if (user.membresia === 'utp_plus') {
          response = `¡Ya eres miembro de Samira Premium! Gracias por tu apoyo. Tienes acceso completo a mis mejores tips de estudio, música exclusiva y recomendaciones inteligentes. 🚀`;
        } else {
          response = `¡Con UTP Plus puedes desbloquear funciones avanzadas! Podrás hacerme preguntas sobre tus tareas, escuchar mis explicaciones con voz personalizada y recibir descuentos exclusivos en la cafetería. Actívalo en la pestaña "Perfil". ✨`;
        }
      } else if (cleanMsg.includes('estudio') || cleanMsg.includes('tips') || cleanMsg.includes('examen')) {
        if (user.membresia === 'utp_plus') {
          response = `Aquí tienes un Tip Premium: Aplica la técnica Pomodoro (25 min de enfoque, 5 min de descanso). Para temas complejos de sistemas, crea diagramas conceptuales. ¡Tú puedes con los exámenes! 📚💻`;
        } else {
          response = `Puedo darte excelentes consejos de estudio si eres miembro Premium de UTP Plus. Puedes activarlo en tu Perfil. ¡No te lo pierdas! 😊`;
        }
      } else if (cleanMsg.includes('musica') || cleanMsg.includes('estudiar')) {
        if (user.membresia === 'utp_plus') {
          response = `Te recomiendo sintonizar nuestra playlist Premium: Lofi Beats UTP 🎧. Te ayudará a concentrarte al máximo para tu laboratorio.`;
        } else {
          response = `La música para estudiar está disponible exclusivamente para miembros Premium UTP Plus. ¡Desbloquéala en tu Perfil para estudiar con el mejor ritmo!`;
        }
      } else if (cleanMsg.includes('recomiendas') || cleanMsg.includes('recomienda')) {
        const available = products.filter(p => p.cantidad > 0);
        if (available.length > 0) {
          const pick = available[Math.floor(Math.random() * available.length)];
          response = `Hoy te super recomiendo probar el ${pick.emoji} *${pick.nombre}* (S/ ${pick.precio.toFixed(2)}). ¡Quedan pocas porciones y está saliendo rapidísimo! 🏃‍♂️💨`;
        } else {
          response = `En este momento estamos reponiendo stock, pero puedes revisar las solicitudes en "Delivery" para ganar puntos ayudando a otros estudiantes. 🚴‍♂️`;
        }
      } else if (cleanMsg.includes('gracias') || cleanMsg.includes('gracia')) {
        response = `¡De nada, ${user.nombre}! Estoy aquí para ayudarte. Disfruta tu día en la UTP. 🔴⚪`;
      } else {
        response = `He recibido tu mensaje: "${userMessage}". Como tu asistente de SmartCafé, puedo ayudarte a revisar el stock de la cafetería, darte recomendaciones de comida, reservar lockers o contarte sobre el servicio de delivery entre estudiantes. ¿Qué necesitas?`;
      }

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(response);
        }, 1000 + Math.random() * 800); // realistic delay
      });
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        currentRoute,
        setRoute,
        user,
        setUser,
        toggleMembresia,
        products,
        setProducts,
        activeOrder,
        setActiveOrder,
        createOrder,
        advanceOrder,
        cancelOrder,
        deliveryRequests,
        setDeliveryRequests,
        acceptDelivery,
        addDeliveryRequest,
        lockers,
        toggleLocker,
        mesas,
        toggleMesa,
        cafeteria,
        triggerAIResponse,
        chatHistory,
        setChatHistory,
        addChatMessage,
        pendingProduct,
        setPendingProduct,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
