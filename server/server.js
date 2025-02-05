import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import checkWinner from '../src/functions/checkWinner.js';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

let board = Array(9).fill(null);
let isXTurn = true;
let players = {}; // { socket.id: 'X' или 'O' }
let playerCount = 0;

io.on('connection', (socket) => {
  console.log('Игрок подключился:', socket.id);

  // Назначаем игроку 'X' или 'O'
  if (playerCount < 2) {
    players[socket.id] = playerCount === 0 ? 'X' : 'O';
    playerCount++;
    socket.emit('playerSymbol', players[socket.id]);
  } else {
    socket.emit('spectator'); // Остальные будут просто смотреть
  }

  socket.emit('gameState', { board, isXTurn });

  socket.on('move', ({ index, symbol }) => {
    if (
      board[index] ||
      checkWinner(board) ||
      players[socket.id] !== symbol ||
      (isXTurn ? 'X' : 'O') !== symbol
    )
      return;

    board[index] = symbol;
    isXTurn = !isXTurn;

    io.emit('gameState', { board, isXTurn });
  });

  socket.on('reset', () => {
    board = Array(9).fill(null);
    isXTurn = true;
    io.emit('gameState', { board, isXTurn });
  });

  socket.on('disconnect', () => {
    console.log('Игрок отключился:', socket.id);
    delete players[socket.id];
    playerCount--;
  });
});

server.listen(3001, () => console.log(`Сервер запущен на 3001`));
