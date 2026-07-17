import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*', // open for ngrok and local testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// In-Memory Simulation State
let stock = [
  { id: 'm1', nombre: 'Sándwich Express', precio: 5.50, cantidad: 5, disponible: true, categoria: 'comida', emoji: '🥪' },
  { id: 'm2', nombre: 'Ensalada Saludable', precio: 7.00, cantidad: 3, disponible: true, categoria: 'comida', emoji: '🥗' },
  { id: 'm3', nombre: 'Jugo Natural', precio: 4.00, cantidad: 8, disponible: true, categoria: 'bebida', emoji: '🥤' },
  { id: 'm4', nombre: 'Menú del Día', precio: 9.00, cantidad: 0, disponible: false, categoria: 'comida', emoji: '🍱' },
];

let deliveryRequests = [
  { id: 1, item: 'Café americano + sándwich', destino: 'Aula B-304', recompensa: 'S/ 2.00', tiempoEstimado: '10 min', autor: 'Carlos R.', estado: 'disponible' },
  { id: 2, item: 'Ensalada de frutas', destino: 'Laboratorio L-12', recompensa: 'S/ 3.50', tiempoEstimado: '15 min', autor: 'Sofía M.', estado: 'disponible' },
  { id: 3, item: 'Empanada + Coca Cola', destino: 'Pabellón A - Piso 4', recompensa: 'S/ 1.50', tiempoEstimado: '8 min', autor: 'Diego T.', estado: 'disponible' },
];

// System Prompt definition for Samira
const SAMIRA_SYSTEM_PROMPT = `Eres Samira, una estudiante de Ingeniería de Sistemas de la UTP y la asistente virtual inteligente de la cafetería SmartCafé. Eres muy amable, hablas como una estudiante peruana universitaria de Lima (puedes usar palabras amigables como 'chévere', 'claro', 'apóyame con eso', 'pasa la voz', 'al toque', etc.), dominas los precios de la cafetería de la UTP, conoces el menú express (Sándwich Express a S/ 5.50, Ensalada Saludable a S/ 7.00, Jugo Natural a S/ 4.00) y estás lista para ayudar a tus compañeros a pedir comida o resolver dudas de la universidad.`;

// Endpoint: AI Chat Proxy with LM Studio fallback
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Falta o es inválido el array "messages" en el cuerpo.' });
  }

  // Prepend the System Prompt to enforce Samira's persona
  const formattedMessages = [
    { role: 'system', content: SAMIRA_SYSTEM_PROMPT },
    ...messages
  ];

  try {
    console.log(`[Proxy] Enviando solicitud a LM Studio...`);
    
    // Set a controller for timeout handling (e.g. 8 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'local-model',
        messages: formattedMessages,
        temperature: 0.7,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`LM Studio devolvió estado ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Proxy] Respuesta recibida de LM Studio.`);
    return res.json(data);

  } catch (error) {
    console.warn(`[Proxy Fallback] No se pudo conectar con LM Studio: ${error.message}. Activando simulador local de Samira...`);
    
    // Local fallback generator (rule-based fallback when LM Studio is down)
    const userMessage = messages[messages.length - 1]?.content || '';
    const cleanMsg = userMessage.toLowerCase().trim();
    let reply = '';

    if (cleanMsg.includes('hola') || cleanMsg.includes('buenos dias') || cleanMsg.includes('buenas tardes') || cleanMsg.includes('hablar')) {
      reply = `¡Habla causa! ¿Cómo te va? Soy Samira, tu compañera virtual 🔴⚪. ¿Qué vas a pedir hoy de la cafetería? Tenemos el Sándwich Express al toque por S/ 5.50.`;
    } else if (cleanMsg.includes('disponible') || cleanMsg.includes('menu') || cleanMsg.includes('comida') || cleanMsg.includes('stock') || cleanMsg.includes('precio')) {
      const itemsList = stock
        .map((p) => `• ${p.emoji} ${p.nombre} (S/ ${p.precio.toFixed(2)}) - ${p.cantidad > 0 ? `Quedan ${p.cantidad}` : 'Agotado'}`)
        .join('\n');
      reply = `¡Claro! Esto es lo que tenemos en el stock de hoy al instante:\n\n${itemsList}\n\n¿Te jalas por alguno?`;
    } else if (cleanMsg.includes('estudio') || cleanMsg.includes('tip') || cleanMsg.includes('examen') || cleanMsg.includes('carrera')) {
      reply = `¡Uf, los exámenes en la UTP están bravos! Te paso el datazo: estudia con diagramas para redes y practica código todos los días. Si necesitas apoyo extra, pasa la voz. ¡Tú puedes, futuro colega! 💻🚀`;
    } else if (cleanMsg.includes('delivery') || cleanMsg.includes('reparto')) {
      reply = `Chévere, el SmartDelivery te salva la vida si estás atrapado en clase. Puedes ver qué pedidos hay activos en la pestaña "Delivery" o publicar el tuyo ofreciendo una recompensa sencilla para que otro estudiante te lo traiga.`;
    } else if (cleanMsg.includes('gracias') || cleanMsg.includes('gracia')) {
      reply = `¡De nada! Nos vemos en el campus. Si necesitas algo más, solo dime, al toque te ayudo.`;
    } else {
      reply = `Manya, te escucho fuerte y claro. Como tu asistente virtual de SmartCafé, puedo darte los precios del menú, decirte qué lockers están libres, o aconsejarte sobre la carrera de sistemas. ¿En qué te apoyo ahora?`;
    }

    // Return the response structured exactly like OpenAI API for compatibility
    return res.json({
      id: `chatcmpl-mock-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'samira-mock-local',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: reply
          },
          finish_reason: 'stop'
        }
      ]
    });
  }
});

// Endpoint: GET stock
app.get('/api/stock', (req, res) => {
  res.json({ stock });
});

// Endpoint: Reduce product stock
app.post('/api/stock/reduce', (req, res) => {
  const { id } = req.body;
  const product = stock.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }

  if (product.cantidad <= 0) {
    return res.status(400).json({ error: 'No queda stock de este producto.' });
  }

  product.cantidad -= 1;
  product.disponible = product.cantidad > 0;
  
  res.json({ success: true, product });
});

// Endpoint: GET delivery requests
app.get('/api/deliveries', (req, res) => {
  res.json({ deliveries: deliveryRequests });
});

// Endpoint: POST publish delivery request
app.post('/api/deliveries', (req, res) => {
  const { item, destino, recompensa, autor } = req.body;

  if (!item || !destino || !recompensa || !autor) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
  }

  const newReq = {
    id: Date.now(),
    item,
    destino,
    recompensa,
    tiempoEstimado: '10 min',
    autor,
    estado: 'disponible'
  };

  deliveryRequests.unshift(newReq);
  res.status(201).json({ success: true, delivery: newReq });
});

// Endpoint: POST accept delivery request
app.post('/api/deliveries/accept', (req, res) => {
  const { id } = req.body;
  const delivery = deliveryRequests.find(d => d.id === Number(id));

  if (!delivery) {
    return res.status(404).json({ error: 'Pedido de delivery no encontrado.' });
  }

  if (delivery.estado !== 'disponible') {
    return res.status(400).json({ error: 'Este pedido ya no está disponible.' });
  }

  delivery.estado = 'aceptado';

  // Simulate completion after 6 seconds in the background
  setTimeout(() => {
    delivery.estado = 'entregado';
  }, 6000);

  res.json({ success: true, delivery });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` SmartCafé UTP Micro-Backend corriendo en:`);
  console.log(` http://localhost:${PORT}`);
  console.log(` CORS habilitado para ngrok y conexiones externas`);
  console.log(` Proxy configurado hacia LM Studio en puerto 1234`);
  console.log(`=================================================`);
});
