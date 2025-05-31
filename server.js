// server.js
import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 3000 });
const clients = new Map();

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
