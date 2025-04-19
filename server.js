// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

let rooms = {};

io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  socket.on('join-room', ({ roomId, name }) => {
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: [],
        deck: [],
        communityCards: [],
        turnoActual: 0,
        fase: 'apuestas',
        acciones: [],
      };
    }

    const room = rooms[roomId];

    if (room.players.length >= 3) {
      socket.emit('room-full');
      return;
    }

    if (!room.players.find(p => p.id === socket.id)) {
      room.players.push({ id: socket.id, name, hand: [] });
    }

    socket.join(roomId);

    io.to(roomId).emit('room-update', room);

    if (room.players.length >= 1) {
      startGame(roomId);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      room.players = room.players.filter(p => p.id !== socket.id);
      io.to(roomId).emit('room-update', room);
    }
  });
});

function startGame(roomId) {
  const room = rooms[roomId];
  const fullDeck = generateDeck();
  const shuffledDeck = shuffle(fullDeck);

  room.players.forEach(player => {
    player.hand = [shuffledDeck.pop(), shuffledDeck.pop()];
  });

  room.communityCards = [shuffledDeck.pop(), shuffledDeck.pop(), shuffledDeck.pop()];
  room.deck = shuffledDeck;
  room.turnoActual = 0;
  room.fase = 'apuestas';
  room.acciones = [null, null, null];

  io.to(roomId).emit('game-started', {
    players: room.players,
    communityCards: room.communityCards,
    deck: room.deck,
    turnoActual: room.turnoActual,
    fase: room.fase,
    acciones: room.acciones,
  });
}

function generateDeck() {
  const values = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const deck = [];

  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
