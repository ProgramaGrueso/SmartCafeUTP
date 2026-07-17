async function test() {
  try {
    const payload = {
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'describe la imagen' },
            { type: 'image_url', image_url: { url: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' } }
          ]
        }
      ]
    };
    
    console.log("Enviando petición de prueba a http://localhost:3001/api/chat...");
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Response Body:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
