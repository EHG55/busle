import React from 'react';
import Card from './Card';

const Player = ({ cards, playerNumber }) => {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {cards.map((card, index) => (
          <Card key={index} value={card.value} suit={card.suit} />
        ))}
      </div>
    </div>
  );
};

export default Player;
