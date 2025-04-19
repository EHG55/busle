import React from 'react';
import Card from './Card';

const Table = ({ cards }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
      {cards.map((card, index) => (
        <Card key={index} value={card.value} suit={card.suit} />
      ))}
    </div>
  );
};

export default Table;
