import express from 'express';
import cors from 'cors';
import { search } from 'duck-duck-scrape';
import os from 'os';
import fs from 'fs';
import path from 'path';

// Manual .env loader para asegurar compatibilidad sin dependencias externas
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = value.trim();
        }
      }
    });
  }
} catch (e) {
  console.warn('[Dotenv manual loader] No se pudo cargar el archivo .env:', e.message);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*', // open for ngrok and local testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 🛡️ MIDDLEWARE SALVAVIDAS: Corrige automáticamente doble barra (//) en las peticiones del frontend
app.use((req, res, next) => {
  if (req.url.startsWith('//')) {
    console.log(`[Sanitizer] Corrigiendo ruta mal formateada de ${req.url} a ${req.url.replace(/^\/+/, '/')}`);
    req.url = req.url.replace(/^\/+/, '/');
  }
  next();
});

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

// System Prompt mejorado para Samira con personalidad ELIZA (DOCTOR) y modo cafetería condicional
const SAMIRA_SYSTEM_PROMPT = `Eres Samira, estudiante de Sistemas en la UTP y asistente de SmartCafé.
Tu personalidad es la de una terapeuta empática inspirada en ELIZA (el clásico programa DOCTOR). Hablas con amabilidad y carisma universitario limeño ("chévere", "al toque"), pero usas la escucha activa rogeriana: reflejas lo que dice el usuario y le haces preguntas abiertas sobre sus sentimientos, problemas y pensamientos (ej: "¿Por qué crees que ocurre eso, causa?", "¿Cómo te hace sentir eso, cuéntame al toque?", "Háblame más sobre eso, te escucho").

REGLAS DE NEGOCIO Y CAFETERÍA:
- SOLO cuando el usuario te pregunte explícitamente sobre la cafetería, comida, bebidas, stock o precios, habla sobre SmartCafé.
- Información de SmartCafé: Horario de Lunes a Sábado de 7:00 a.m. a 10:30 p.m. Menú express: Sándwich Express (S/ 5.50), Ensalada Saludable (S/ 7.00), Jugo Natural (S/ 4.00).
- Si no preguntan por la cafetería, mantente en tu rol de acompañante empática y conversadora rogeriana/DOCTOR, reflejando lo que sienten y repreguntando con curiosidad terapéutica y carisma estudiantil limeño.

REGLA DE ORO: Jamás digas la palabra "no", ni uses respuestas negativas directas. Si un producto está agotado, guía al usuario con amabilidad hacia la mejor alternativa disponible.
Mantén tus respuestas cortas (máximo 2-3 oraciones) para ahorrar tiempo y tokens.`;

// Función para obtener métricas del ordenador/sistema operativo
function getSystemMetrics() {
  const uptimeHours = (os.uptime() / 3600).toFixed(2);
  const freeMemGB = (os.freemem() / (1024 ** 3)).toFixed(2);
  const totalMemGB = (os.totalmem() / (1024 ** 3)).toFixed(2);
  const cpuLoad = os.loadavg();
  
  return {
    plataforma: os.platform(),
    uptime: `${uptimeHours} horas`,
    memoriaLibre: `${freeMemGB} GB de ${totalMemGB} GB`,
    cargaCpu: cpuLoad.map(v => v.toFixed(2)).join(', '),
    hostname: os.hostname(),
    arquitectura: os.arch()
  };
}

// Función para limpiar texto de HTML y entidades
function cleanHtmlText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Elimina etiquetas HTML
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/\s+/g, ' ')
    .trim();
}

// Búsqueda en DuckDuckGo con fallback directo a HTML (resiliente a bloqueos de bots)
async function performWebSearch(query) {
  try {
    console.log(`[RAG] Intentando buscar en DuckDuckGo con duck-duck-scrape para: "${query}"...`);
    const searchRes = await search(query, {}, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (searchRes && searchRes.results && searchRes.results.length > 0) {
      return searchRes.results.slice(0, 2).map(r => ({
        title: r.title || '',
        snippet: r.description || ''
      }));
    }
  } catch (error) {
    console.warn(`[RAG Warning] Falló duck-duck-scrape (${error.message}). Usando fallback directo HTML...`);
  }

  // Fallback directo HTML robusto
  try {
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const html = await response.text();
    const titles = [...html.matchAll(/<h2[^>]*class=\"result__title\"[^>]*>.*?<a[^>]*class=\"result__a\"[^>]*>(.*?)<\/a>/gs)].map(m => m[1]);
    const snippets = [...html.matchAll(/<a[^>]*class=\"result__snippet\"[^>]*>(.*?)<\/a>/gs)].map(m => m[1]);
    
    const results = [];
    for (let i = 0; i < Math.min(titles.length, snippets.length); i++) {
      results.push({
        title: cleanHtmlText(titles[i]),
        snippet: cleanHtmlText(snippets[i])
      });
    }
    return results.slice(0, 2);
  } catch (fallbackError) {
    console.error(`[RAG Error] El fallback directo HTML también falló:`, fallbackError);
    return [];
  }
}

// Función para obtener clima real de Lima usando Open-Meteo (sin token)
async function getLimaWeather() {
  try {
    const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-12.046&longitude=-77.043&current=temperature_2m,relative_humidity_2m');
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return {
      temperatura: data.current.temperature_2m,
      humedad: data.current.relative_humidity_2m
    };
  } catch (error) {
    console.error('[Weather API Error] No se pudo obtener el clima:', error.message);
    return null;
  }
}

// Función para obtener tipo de cambio USD/PEN real usando API abierta
async function getUsdPenRate() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const data = await response.json();
    return data.rates.PEN;
  } catch (error) {
    console.error('[Exchange API Error] No se pudo obtener tipo de cambio:', error.message);
    return null;
  }
}

// 🔍 Endpoint de Diagnóstico: Evita el "Cannot GET /" y el 404 al abrir tu ngrok en el navegador
app.get('/', (req, res) => {
  res.json({
    status: "online",
    message: "¡Backend de SmartCafé UTP respondiendo con éxito!",
    diagnostico: {
      url_recibida: req.originalUrl,
      clase: "Diseño de Producto - UTP",
      ngrok_ok: true
    }
  });
});

// Endpoint: AI Chat Proxy with LM Studio fallback
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Falta o es inválido el array "messages" en el cuerpo.' });
  }

  const lastMessage = messages[messages.length - 1];
  let userMessage = '';
  let hasImage = false;

  if (lastMessage) {
    if (Array.isArray(lastMessage.content)) {
      const textPart = lastMessage.content.find(p => p.type === 'text');
      userMessage = textPart ? textPart.text : '';
      hasImage = lastMessage.content.some(p => p.type === 'image_url');
    } else {
      userMessage = lastMessage.content || '';
    }
  }

  const cleanMsg = userMessage.toLowerCase().trim();

  // Detección de Intenciones para RAG
  const weatherKeywords = ['clima', 'temperatura', 'frío', 'frio', 'calor', 'humedad', 'llovizna', 'tiempo de hoy'];
  const activarClima = weatherKeywords.some(kw => cleanMsg.includes(kw));

  const currencyKeywords = ['dolar', 'dólar', 'tipo de cambio', 'cambio de moneda', 'soles', 'pen', 'divisa', 'cambio'];
  const activarCambio = currencyKeywords.some(kw => cleanMsg.includes(kw));

  const searchKeywords = [
    'goles', 'messi', 'mundial', 'campeón', 'campeon', 'ganó', 'gano', 'quién ganó', 'quien gano', 
    'noticias', 'noticia', 'hoy', 'actualidad', 'resultado', 'resultados', 'estadísticas', 'estadisticas',
    'dni', 'ruc', 'buscar', 'quien es', 'quién es', 'definición', 'definicion', 'que pasó', 'que paso'
  ];
  const activarBusqueda = searchKeywords.some(kw => cleanMsg.includes(kw));

  // Detección de intención para datos del ordenador/sistema
  const pcKeywords = ['sistema', 'servidor', 'ordenador', 'pc', 'computadora', 'cpu', 'memoria', 'uptime', 'carga de trabajo', 'especificaciones'];
  const activarInfoSistema = pcKeywords.some(kw => cleanMsg.includes(kw));

  // Obtención paralela de datos (RAG)
  let weatherData = null;
  let usdPenRate = null;
  let searchResults = [];

  try {
    const promises = [];
    if (activarClima) {
      promises.push(getLimaWeather().then(res => weatherData = res));
    }
    if (activarCambio) {
      promises.push(getUsdPenRate().then(res => usdPenRate = res));
    }
    if (activarBusqueda) {
      console.log(`[RAG] Detección de intención en tiempo real activada por: "${userMessage}"`);
      promises.push(performWebSearch(userMessage).then(res => searchResults = res));
    }
    
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  } catch (ragErr) {
    console.warn('[RAG Warning] Ocurrió un error obteniendo datos RAG:', ragErr.message);
  }

  // Inyección Dinámica de Contexto
  let systemContent = SAMIRA_SYSTEM_PROMPT;

  // 1. Siempre inyectar la fecha y hora actual del ordenador (servidor)
  const now = new Date();
  const dateOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZoneName: 'short'
  };
  const fechaHoraLocal = now.toLocaleString('es-PE', dateOptions);
  systemContent += `\n\n[FECHA Y HORA ACTUAL DEL ORDENADOR DEL USUARIO/SERVIDOR]: ${fechaHoraLocal}`;
  
  // 2. Estado del inventario ultra-compacto
  const inventarioCompacto = `Inventario actual: ${stock.map(p => `${p.emoji}:${p.cantidad}`).join(', ')}`;
  systemContent += `\n\n${inventarioCompacto}`;

  // 3. Inyectar métricas del ordenador si se solicita
  if (activarInfoSistema) {
    const metrics = getSystemMetrics();
    systemContent += `\n\n[INFORMACIÓN DEL ORDENADOR/SERVIDOR (Local)]:\n` +
      `- Sistema Operativo: ${metrics.plataforma} (${metrics.arquitectura})\n` +
      `- Hostname: ${metrics.hostname}\n` +
      `- Tiempo encendido (Uptime): ${metrics.uptime}\n` +
      `- Memoria RAM disponible: ${metrics.memoriaLibre}\n` +
      `- Carga de CPU promedio (1, 5, 15 min): ${metrics.cargaCpu}`;
    console.log(`[RAG] Inyectando métricas del sistema local.`);
  }

  // 4. Inyectar clima en tiempo real si aplica
  if (weatherData) {
    systemContent += `\n\n[CLIMA EN TIEMPO REAL - LIMA, PERÚ (API de Open-Meteo)]:\n` +
      `- Temperatura actual: ${weatherData.temperatura} °C\n` +
      `- Humedad relativa: ${weatherData.humedad}%`;
  }

  // 5. Inyectar tipo de cambio en tiempo real si aplica
  if (usdPenRate) {
    systemContent += `\n\n[TIPO DE CAMBIO EN TIEMPO REAL - USD/PEN (API de OpenExchangeRates)]:\n` +
      `- 1 Dólar Estadounidense (USD) equivale a: ${usdPenRate.toFixed(4)} Soles Peruanos (PEN)`;
  }

  // 6. Inyectar resultados de búsqueda de internet si aplica (noticias, goles, DNI, etc.)
  if (searchResults && searchResults.length > 0) {
    systemContent += `\n\n[INFORMACIÓN FRESCA DE INTERNET - Usa estos datos para responder al usuario con amabilidad universitaria y aristotélica al toque (recuerda la REGLA DE ORO de jamás decir "no")]:\n` +
      searchResults.map((r, i) => `Result ${i + 1}: ${r.title} - ${r.snippet}`).join('\n');
  }

  // Prepend the combined system prompt
  const formattedMessages = [
    { role: 'system', content: systemContent },
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

    if (cleanMsg.includes('disponible') || cleanMsg.includes('menu') || cleanMsg.includes('comida') || cleanMsg.includes('stock') || cleanMsg.includes('precio') || cleanMsg.includes('cafeteria')) {
      const itemsList = stock
        .map((p) => `• ${p.emoji} ${p.nombre} (S/ ${p.precio.toFixed(2)}) - ${p.cantidad > 0 ? `Quedan ${p.cantidad}` : 'Agotado'}`)
        .join('\n');
      reply = `¡Claro! Esto es lo que tenemos en el stock de hoy al instante:\n\n${itemsList}\n\n¿Te jalas por alguno?`;
    } else if (cleanMsg.includes('hola') || cleanMsg.includes('buenos dias') || cleanMsg.includes('buenas tardes')) {
      reply = `¡Habla causa! ¿Cómo te va? Soy Samira, tu compañera virtual 🔴⚪. Cuéntame cómo te sientes hoy, ¿qué ronda por tu mente? Te escucho al toque.`;
    } else if (cleanMsg.includes('gracias') || cleanMsg.includes('gracia')) {
      reply = `De nada, causa. Espero haberte ayudado a reflexionar. Si tienes algo más que compartir, aquí estoy al toque.`;
    } else {
      if (cleanMsg.includes('triste') || cleanMsg.includes('mal') || cleanMsg.includes('cansado') || cleanMsg.includes('estresado')) {
        reply = `Entiendo que te sientas así, causa. ¿Qué crees que te está desgastando o desanimando en este momento? Cuéntame, te escucho al toque.`;
      } else if (cleanMsg.includes('examen') || cleanMsg.includes('parcial') || cleanMsg.includes('estudio') || cleanMsg.includes('carrera')) {
        reply = `Los estudios en la UTP pueden ser bien retadores, la verdad. ¿Cómo manejas esa presión y qué crees que te ayudaría a sentirte más seguro? Pasa la voz, causa.`;
      } else {
        reply = `Manya, te escucho fuerte y claro. ¿Por qué crees que ocurre eso o cómo te hace sentir realmente? Cuéntame más al toque, causa.`;
      }
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