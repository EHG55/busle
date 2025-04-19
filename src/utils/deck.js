const values = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

export const generateDeck = () => {
  const deck = [];

  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }

  // Mezclar el mazo
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

export const dealCards = (deck, numPlayers = 3) => {
  const players = Array(numPlayers).fill().map(() => []);
  const communityCards = [];

  // Dar 2 cartas a cada jugador
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < numPlayers; j++) {
      players[j].push(deck.pop());
    }
  }

  // 3 cartas comunes al centro
  for (let i = 0; i < 3; i++) {
    communityCards.push(deck.pop());
  }

  return { players, communityCards, deck };
};

export const cardValues = values;