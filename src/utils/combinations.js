import { cardValues as values } from './deck';

// Ejemplo de jerarquía para evaluar combinaciones
const rankOrder = {
  'Trío': 6,
  'Tanke': 5,
  'Intermedia': 4,
  'Chikitica': 3,
  'Una carta': 2,
  'Sin combinación': 1
};

export function evaluateHand(hand, commons, round) {
  const allCards = [...hand, ...commons];
  const valueCounts = {};

  allCards.forEach(card => {
    valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
  });

  const valuesOrdenadas = values.slice().reverse(); // A, K, Q...

  // Trío
  for (let val of valuesOrdenadas) {
    if (valueCounts[val] === 3) {
      return { rank: rankOrder['Trío'], name: 'Trío', high: valuesOrdenadas.indexOf(val) };
    }
  }

  // Tanke (par común + una igual en mano)
  const comunes = commons.map(c => c.value);
  const enMano = hand.map(c => c.value);
  for (let val of comunes) {
    if (enMano.includes(val) && comunes.filter(v => v === val).length === 2) {
      return { rank: rankOrder['Tanke'], name: 'Tanke', high: valuesOrdenadas.indexOf(val) };
    }
  }

  // Intermedia (una común + una igual en mano)
  for (let val of comunes) {
    if (enMano.includes(val)) {
      return { rank: rankOrder['Intermedia'], name: 'Intermedia', high: valuesOrdenadas.indexOf(val) };
    }
  }

  // Chikitica (par en mano)
  if (hand[0].value === hand[1].value) {
    return { rank: rankOrder['Chikitica'], name: 'Chikitica', high: valuesOrdenadas.indexOf(hand[0].value) };
  }

  // Una carta (coincide una con común)
  for (let val of enMano) {
    if (comunes.includes(val)) {
      return { rank: rankOrder['Una carta'], name: 'Una carta', high: valuesOrdenadas.indexOf(val) };
    }
  }

  return { rank: rankOrder['Sin combinación'], name: 'Sin combinación', high: -1 };
}
