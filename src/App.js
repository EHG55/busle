import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import Player from './components/Player';
import Table from './components/Table';
import { evaluateHand } from './utils/combinations';

const socket = io('https://busle.onrender.com');

function App() {
  const [playerName, setPlayerName] = useState('');
  const [deck, setDeck] = useState([]);
  const [players, setPlayers] = useState([]);
  const [tableCards, setTableCards] = useState([]);
  const [round, setRound] = useState(1);
  const [turnoActual, setTurnoActual] = useState(0);
  const [acciones, setAcciones] = useState([null, null]);
  const [jugadoresActivos, setJugadoresActivos] = useState([true, true]);
  const [fase, setFase] = useState('esperando');
  const [descartesUsados, setDescartesUsados] = useState([false, false]);
  const [ganador, setGanador] = useState(null);
  const [jugadorQueAposto, setJugadorQueAposto] = useState(null);
  const [pendientesPorResponder, setPendientesPorResponder] = useState([0, 1]);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    tg?.ready();
    tg?.expand();

    const user = tg?.initDataUnsafe?.user;
    if (user) {
      const nombre = user.username || user.first_name || '';
      setPlayerName(nombre);
      socket.emit('join-room', { roomId: 'sala-busle', name: nombre });
    } else {
      const nombre = prompt("Ingresa tu nombre para jugar:") || `Invitado-${Math.floor(Math.random()*1000)}`;
      setPlayerName(nombre);
      socket.emit('join-room', { roomId: 'sala-busle', name: nombre });
    }
  }, []);

  useEffect(() => {
    socket.on('game-started', (roomState) => {
      console.log("🚀 GAME STARTED", roomState);
      const { players: manos, communityCards: comunes, deck: mazoRestante } = roomState;
      setDeck(mazoRestante);
      setPlayers(manos);
      setTableCards(comunes);
      setRound(1);
      setTurnoActual(roomState.turnoActual || 0);
      setAcciones([null, null]);
      setJugadoresActivos([true, true]);
      setDescartesUsados([false, false]);
      setFase('apuestas');
      setGanador(null);
      setJugadorQueAposto(null);
      setPendientesPorResponder([0, 1]);
    });

    socket.on('room-update', (roomState) => {
      console.log('Estado actualizado:', roomState);
      setPlayers(roomState.players || []);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (players.length < 2) {
    return (
      <div className="App">
        <h2>Esperando jugadores... ({players.length}/2)</h2>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>BUSLE - Ronda {round} ({fase.toUpperCase()})</h1>
      <div className="mesa">
        <div className="jugador jugador2">
          <h3>Jugador 2</h3>
          {players[1]?.hand?.length === 2 && <Player cards={players[1].hand} playerNumber={2} />}
        </div>

        <div className="cartas-comunes">
          {tableCards?.length === 3 ? (
            <Table cards={tableCards} />
          ) : (
            <p>Cargando cartas comunes...</p>
          )}
        </div>

        <div className="jugador jugador1">
          <h3>{playerName}</h3>
          {players[0]?.hand?.length === 2 && <Player cards={players[0].hand} playerNumber={1} />}
        </div>
      </div>

      <pre style={{ textAlign: 'left', padding: '1em', fontSize: '0.8em', background: '#f0f0f0', borderRadius: '8px' }}>
        {JSON.stringify(players, null, 2)}
      </pre>

      {ganador && <h2>{ganador}</h2>}
    </div>
  );
}

export default App;
