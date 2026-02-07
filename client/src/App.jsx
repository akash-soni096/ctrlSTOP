import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const socket = io("http://localhost:3000");

// --- 1. GAME DATA ---
const GAMES = [
  { id: 1, title: "Valorant", color: "#ff4655", img: "https://placehold.co/300x450/ff4655/white?text=VALORANT" },
  { id: 2, title: "Grand Theft Auto V", color: "#459c5e", img: "https://placehold.co/300x450/459c5e/white?text=GTA+V" },
  { id: 3, title: "Cyberpunk 2077", color: "#fcee0a", img: "https://placehold.co/300x450/fcee0a/black?text=CYBERPUNK" },
  { id: 4, title: "Fortnite", color: "#1fa2ff", img: "https://placehold.co/300x450/1fa2ff/white?text=FORTNITE" },
  { id: 5, title: "Call of Duty", color: "#111", img: "https://placehold.co/300x450/333/white?text=CALL+OF+DUTY" },
  { id: 6, title: "League of Legends", color: "#c9aa71", img: "https://placehold.co/300x450/c9aa71/black?text=LEAGUE" },
];

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  
  // NEW: Store the Station ID in state (starts as null)
  const [myStationId, setMyStationId] = useState(null);
  
  const [isLocked, setIsLocked] = useState(true);
  const [timeLeft, setTimeLeft] = useState("00:00");
  const [activeGame, setActiveGame] = useState(null);

  // --- EFFECT 1: Handle Station Registration ---
  useEffect(() => {
    // Only register if we have chosen an ID
    if (myStationId) {
        console.log(`🔌 Registering as ${myStationId}...`);
        socket.emit('register_station', myStationId);

        // Listen for reconnects to re-register automatically
        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('register_station', myStationId);
        });
    }
  }, [myStationId]); // Run this whenever myStationId changes

  // --- EFFECT 2: General Listeners ---
  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('command_unlock', () => setIsLocked(false));
    
    socket.on('command_lock', () => {
      setIsLocked(true);
      setActiveGame(null);
    });

    socket.on('timer_update', (data) => {
      setTimeLeft(formatTime(data.secondsRemaining));
    });

    // "Sync" handles the initial state when we first register
    socket.on('sync_status', (data) => {
        console.log("Received Sync:", data);
        setIsLocked(data.isLocked);
        setTimeLeft(formatTime(data.secondsRemaining));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('command_unlock');
      socket.off('command_lock');
      socket.off('timer_update');
      socket.off('sync_status');
    };
  }, []);

  const launchGame = (game) => setActiveGame(game);
  const exitGame = () => setActiveGame(null);

  // --- VIEW 0: SETUP SCREEN (If no station ID is selected) ---
  if (!myStationId) {
      return (
          <div style={{ 
              height: '100vh', background: '#111', color: 'white', 
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Segoe UI'
          }}>
              <h1 style={{ color: '#ff6600' }}>⚠️ SYSTEM SETUP</h1>
              <p>Select which station this computer is:</p>
              
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <button onClick={() => setMyStationId('station-1')} style={setupBtnStyle}>STATION 1</button>
                  <button onClick={() => setMyStationId('station-2')} style={setupBtnStyle}>STATION 2</button>
                  <button onClick={() => setMyStationId('station-3')} style={setupBtnStyle}>STATION 3</button>
              </div>
          </div>
      );
  }

  // --- NORMAL APP VIEWS ---
  return (
    <div style={{ 
      backgroundColor: '#050505', color: '#fff', height: '100vh', 
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Segoe UI, sans-serif', userSelect: 'none', overflow: 'hidden'
    }}>
      
      {/* TOP BAR */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '20px 40px', background: 'linear-gradient(to bottom, #111, transparent)'
      }}>
        <div style={{ display:'flex', flexDirection:'column' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff6600' }}>ctrlSTOP</span>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>{myStationId.toUpperCase()}</span>
        </div>
        
        <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold', textShadow: '0 0 10px rgba(255,255,255,0.2)' }}>
          {timeLeft}
        </div>
        
        <div style={{ fontSize: '0.9rem', color: isConnected ? '#0f0' : '#f00' }}>
          {isConnected ? "● ONLINE" : "● OFFLINE"}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* VIEW 1: LOCKED */}
        {isLocked && (
           <div style={{ 
             textAlign: 'center', border: '2px solid #ff6600', padding: '50px', 
             borderRadius: '20px', background: '#111', boxShadow: '0 0 50px rgba(255, 102, 0, 0.1)' 
           }}>
             <h1 style={{ fontSize: '4rem', margin: 0 }}>LOCKED</h1>
             <p style={{ color: '#888', marginTop: '10px' }}>{myStationId.toUpperCase()} - Awaiting Session</p>
           </div>
        )}

        {/* VIEW 2: DASHBOARD */}
        {!isLocked && !activeGame && (
          <div style={{ width: '100%', maxWidth: '1200px', padding: '20px' }}>
            <h2 style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              Library <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '10px' }}>6 GAMES INSTALLED</span>
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '30px' }}>
              {GAMES.map(game => (
                <div key={game.id} onClick={() => launchGame(game)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                  <div style={{ height: '270px', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.5)', border: '1px solid #333', position: 'relative' }}>
                    <img src={game.img} alt={game.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '10px', background: 'rgba(0,0,0,0.8)', fontWeight: 'bold' }}>{game.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: IN-GAME */}
        {!isLocked && activeGame && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: activeGame.color, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '5rem', margin: 0, textShadow: '0 5px 20px rgba(0,0,0,0.5)' }}>{activeGame.title}</h1>
            <p style={{ fontSize: '1.5rem', opacity: 0.8 }}>GAME IS RUNNING...</p>
            <img src={activeGame.img} style={{ width: '300px', height: '450px', objectFit: 'cover', marginTop: '20px', borderRadius: '10px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} />
            <button onClick={exitGame} style={{ marginTop: '50px', padding: '15px 30px', fontSize: '1.2rem', background: 'rgba(0,0,0,0.5)', border: '2px solid white', color: 'white', cursor: 'pointer', borderRadius: '50px' }}>Esc / Exit Game</button>
          </div>
        )}
      </div>
    </div>
  )
}

// Button Styles
const setupBtnStyle = {
    padding: '20px 40px', fontSize: '1.5rem', cursor: 'pointer',
    background: '#333', color: 'white', border: '2px solid #555', borderRadius: '10px'
};

export default App