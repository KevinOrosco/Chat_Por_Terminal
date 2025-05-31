// server.js
import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 3000 });
const clients = new Map();

// enviar un mensaje a todos los clientes conectados al servidor, excepto al que lo envió
function broadcast(message, senderSocket = null) {
  for (const [client, username] of clients.entries()) {
    if (client.readyState === WebSocket.OPEN && client !== senderSocket) {
      client.send(message);
    }
  }
}

wss.on('connection', (ws) => {
  let username = '';

  ws.send('[Servidor]: Bienvenido. Por favor, ingresa tu nombre de usuario:');

  ws.on('message', (data) => {
    const message = data.toString().trim();

    if (!username) {
      username = message;
      clients.set(ws, username);
      ws.send(`[Servidor]: Conectado al chat como "${username}".`);
      broadcast(`[Servidor]: El usuario "${username}" se ha unido al chat.`, ws);
      return;
    }

    broadcast(`${username}: ${message}`, ws);
  });

  ws.on('close', () => {
    if (username) {
      clients.delete(ws);
      broadcast(`[Servidor]: El usuario "${username}" ha salido del chat.`);
    }
  });
});

console.log('[Servidor]: Esperando conexiones');

// Notificar cierre en 1 minuto
setTimeout(() => {
  broadcast('[Servidor]: El chat se cerrará en 1 minuto.');
}, 2 * 60 * 1000);

// Cerrar servidor cuando se acaba el tiempo
setTimeout(() => {
  broadcast('[Servidor]: El chat se ha cerrado. Desconectando...');

  // Cerrar todas las conexiones
  for (const [client] of clients.entries()) {
    client.close();
  }

  wss.close(() => {
    console.log('[Servidor]: Chat cerrado.');
    process.exit(0); // Finaliza el proceso
  });
}, 3 * 60 * 1000); // 3 minutos