// App.js
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import Player from './components/Player';
import Table from './components/Table';
import { evaluateHand } from './utils/combinations';

const socket = io('http://localhost:4000');

function App() {
  const [playerName, setPlayerName] = useState('');
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [tableCards, setTableCards] = useState([]);
  const [round, setRound] = useState(1);
  const [turnoActual, setTurnoActual] = useState(0);
  const [acciones, setAcciones] = useState([null, null, null]);
  const [jugadoresActivos, setJugadoresActivos] = useState([true, true, true]);
  const [fase, setFase] = useState('esperando');
  const [descartesUsados, setDescartesUsados] = useState([false, false, false]);
  const [ganador, setGanador] = useState(null);
  const [jugadorQueAposto, setJugadorQueAposto] = useState(null);
  const [pendientesPorResponder, setPendientesPorResponder] = useState([0, 1, 2]);

  useEffect(() => {
    if (window.Telegram) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const checkUser = () => {
        const user = tg.initDataUnsafe?.user;
        if (user) {
          const nombre = user.username || user.first_name;
          setPlayerName(nombre);
          socket.emit('join-room', { roomId: 'sala-busle', name: nombre });
        } else {
          console.log("No se detectó usuario de Telegram");
        }
      };

      setTimeout(checkUser, 300);
    }
  }, []);

  useEffect(() => {
    socket.on('game-started', (roomState) => {
      const { players: manos, communityCards: comunes, deck: mazoRestante } = roomState;
      setDeck(mazoRestante);
      setPlayers(manos);
      setTableCards(comunes);
      setRound(1);
      setTurnoActual(roomState.turnoActual || 0);
      setAcciones([null, null, null]);
      setJugadoresActivos([true, true, true]);
      setDescartesUsados([false, false, false]);
      setFase('apuestas');
      setGanador(null);
      setJugadorQueAposto(null);
      setPendientesPorResponder([0, 1, 2]);
    });

    socket.on('room-update', (roomState) => {
      console.log('Estado actualizado:', roomState);
      setPlayers(roomState.players || []);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const hacerAccion = (tipo) => {
    const playerIndex = players.findIndex(p => p.name === playerName);
    if (playerIndex === -1) return;
    socket.emit('player-action', { roomId: 'sala-busle', playerId: playerIndex, action: tipo });
  };

  const discardCards = (index, indices) => {
    if (fase !== 'descartes' || descartesUsados[index] || !jugadoresActivos[index]) return;
    const nuevoDeck = [...deck];
    const nuevasManos = [...players];
    indices.forEach(i => {
      nuevasManos[index][i] = nuevoDeck.pop();
    });
    const nuevosDescartes = [...descartesUsados];
    nuevosDescartes[index] = true;
    setPlayers(nuevasManos);
    setDeck(nuevoDeck);
    setDescartesUsados(nuevosDescartes);
  };

  const pasarDescartes = (index) => {
    if (fase !== 'descartes' || descartesUsados[index] || !jugadoresActivos[index]) return;
    const nuevosDescartes = [...descartesUsados];
    nuevosDescartes[index] = true;
    setDescartesUsados(nuevosDescartes);
  };

  const siguienteRonda = () => {
    if (round < 3) {
      setRound(round + 1);
      setAcciones([null, null, null]);
      setFase('apuestas');
      setDescartesUsados([false, false, false]);
      setTurnoActual(jugadoresActivos.findIndex(j => j));
      setJugadorQueAposto(null);
      setPendientesPorResponder(jugadoresActivos.map((act, i) => act ? i : null).filter(i => i !== null));
    } else {
      evaluarGanador();
    }
  };

  const evaluarGanador = () => {
    const resultados = players.map((cartas, i) =>
      jugadoresActivos[i] ? evaluateHand(cartas, tableCards, round) : { rank: -1, name: 'Retirado' }
    );
    let mejor = resultados[0];
    let ganadorIndex = 0;
    for (let i = 1; i < resultados.length; i++) {
      if (
        resultados[i].rank > mejor.rank ||
        (resultados[i].rank === mejor.rank && resultados[i].rank === 1 && resultados[i].high > mejor.high)
      ) {
        mejor = resultados[i];
        ganadorIndex = i;
      }
    }
    setGanador(`Ganador: Jugador ${ganadorIndex + 1} con ${mejor.name}`);
  };

  if (players.length < 2) return <div className="App"><h2>Esperando jugadores... ({players.length}/2)</h2></div>;

  return (
    <div className="App">
      <h1>BUSLE - Ronda {round} ({fase.toUpperCase()})</h1>
      <div className="mesa">
        <div className="jugador jugador2">
          <h3>Jugador 2</h3>
          <Player cards={players[1]} playerNumber={2} />
        </div>

        <div className="cartas-comunes">
          <Table cards={tableCards} />
        </div>

        <div className="jugador jugador3">
          <h3>Jugador 3</h3>
          <Player cards={players[2]} playerNumber={3} />
        </div>

        <div className="jugador jugador1">
          <h3>{playerName}</h3>
          {
            (() => {
              const playerIndex = players.findIndex(p => p.name === playerName);
              return <Player cards={players[playerIndex]} playerNumber={playerIndex + 1} />;
            })()
          }

          {
            (() => {
              const playerIndex = players.findIndex(p => p.name === playerName);
              return jugadoresActivos[playerIndex] && fase === 'apuestas' && turnoActual === playerIndex;
            })() && (
            <div className="botones">
              {!acciones.includes('apostó') && <button onClick={() => hacerAccion('pasó')}>Pasar</button>}
              <button onClick={() => hacerAccion('apostó')}>Apostar</button>
              {acciones.includes('apostó') && <button onClick={() => hacerAccion('igualó')}>Igualar</button>}
              <button onClick={() => hacerAccion('retirado')}>Retirarse</button>
            </div>
          )}

          {
            (() => {
              const playerIndex = players.findIndex(p => p.name === playerName);
              return jugadoresActivos[playerIndex] && fase === 'descartes';
            })() && (
            <div className="botones">
              {(() => {
                const playerIndex = players.findIndex(p => p.name === playerName);
                return <button disabled={descartesUsados[playerIndex]} onClick={() => discardCards(playerIndex, [0])}>Descartar Carta 1</button>;
              })()}
              {(() => {
                const playerIndex = players.findIndex(p => p.name === playerName);
                return <button disabled={descartesUsados[playerIndex]} onClick={() => discardCards(playerIndex, [1])}>Descartar Carta 2</button>;
              })()}
              {(() => {
                const playerIndex = players.findIndex(p => p.name === playerName);
                return <button disabled={descartesUsados[playerIndex]} onClick={() => discardCards(playerIndex, [0, 1])}>Descartar Ambas</button>;
              })()}
              {(() => {
                const playerIndex = players.findIndex(p => p.name === playerName);
                return <button disabled={descartesUsados[playerIndex]} onClick={() => pasarDescartes(playerIndex)}>Pasar</button>;
              })()}
            </div>
          )}

          {
            (() => {
              const playerIndex = players.findIndex(p => p.name === playerName);
              return !jugadoresActivos[playerIndex] && <p style={{ color: 'red' }}>Retirado</p>;
            })()
          }
        </div>
      </div>

      {fase === 'descartes' && descartesUsados.every((d, i) => !jugadoresActivos[i] || d) && (
        <button onClick={siguienteRonda}>Siguiente Ronda</button>
      )}

      {ganador && <h2>{ganador}</h2>}
      {ganador && <button onClick={() => socket.emit('join-room', { roomId: 'sala-busle', name: playerName })}>Jugar de Nuevo</button>}
    </div>
  );
}

export default App;
