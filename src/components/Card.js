import React from 'react';
import './Card.css';

const Card = ({ value, suit, hidden }) => {
  if (hidden) {
    return <div className="card back"></div>;
  }

  const getSuitSymbol = () => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '?';
    }
  };

  return (
    <div className={`card ${suit}`}>
      <div className="card-value top">{value}</div>
      <div className="card-suit">{getSuitSymbol()}</div>
      <div className="card-value bottom">{value}</div>
    </div>
  );
};

export default Card;