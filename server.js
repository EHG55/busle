const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { generateDeck } = require('./src/utils/deck');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

const rooms = {};

function startGame(roomId) {
  const room = rooms[roomId];
  const deck = generateDeck();
  const players = room.players.map(p => ({ ...p, hand: [deck.pop(), deck.pop()] }));
  const communityCards = [deck.pop(), deck.pop(), deck.pop()];

  room.players = players;
  room.communityCards = communityCards;
  room.deck = deck;
  room.turnoActual = 0;
  room.fase = 'apuestas';
  room.acciones = Array(room.players.length).fill(null);

  io.to(roomId).emit('game-started', {
    players,
    communityCards,
    deck,
    turnoActual: 0,
    fase: 'apuestas',
    acciones: Array(room.players.length).fill(null)
  });
}

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join-room', ({ roomId, name }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        deck: [],
        communityCards: [],
        turnoActual: 0,
        fase: 'esperando',
        acciones: []
      };
    }

    const room = rooms[roomId];

    if (room.players.length >= 2) {
      socket.emit('room-full');
      return;
    }

    if (!room.players.find(p => p.id === socket.id)) {
      room.players.push({ id: socket.id, name, hand: [] });
    }

    socket.join(roomId);
    io.to(roomId).emit('room-update', room);

    if (room.players.length === 2) {
      startGame(roomId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter(p => p.id !== socket.id);
      io.to(roomId).emit('room-update', room);
    }
  });
});

server.listen(4000, () => {
  console.log('Servidor escuchando en http://localhost:4000');
});
