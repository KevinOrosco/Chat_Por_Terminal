// client.js
import WebSocket from 'ws';
import readline from 'readline'; 
import chalk from 'chalk'; // Colores

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ws = new WebSocket('ws://localhost:3000');
let usernameSet = false;

ws.on('message', (data) => {
  const msg = data.toString();

  if (msg.includes('[Servidor]: Bienvenido')) {
    process.stdout.write(chalk.green(msg) + '\n');
    rl.question('> ', (username) => {
      ws.send(username);
      usernameSet = true;
    });
  } else if (msg.startsWith('[Servidor]:')) {
    console.log(chalk.green(msg));
  } else {
    console.log(msg);
  }
});

rl.on('line', (input) => {
  if (usernameSet) {
    ws.send(input.trim());
  }
});

ws.on('close', () => {
  console.log(chalk.red('[Servidor]: Conexión cerrada.'));
  process.exit();
});
