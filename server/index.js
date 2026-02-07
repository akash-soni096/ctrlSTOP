const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs'); // NEW: File System module to save data

const app = express();
app.use(cors());

app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/admin.html');
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const DATA_FILE = 'stations.json';

// --- 1. LOAD DATA ON STARTUP ---
let stations = {};

if (fs.existsSync(DATA_FILE)) {
    console.log("💾 Found previous session! Loading data...");
    const rawData = fs.readFileSync(DATA_FILE);
    stations = JSON.parse(rawData);
    
    // IMPORTANT: Resurrect the timers!
    // JSON saves the numbers, but not the running "interval" functions.
    // We must restart them manually.
    for (const [id, data] of Object.entries(stations)) {
        // Reset the interval placeholder
        data.interval = null; 
        
        if (!data.isLocked && data.time > 0) {
            console.log(`▶️ Resuming timer for ${id}`);
            startStationTimer(id);
        }
    }
} else {
    console.log("🆕 No save file found. Creating new session.");
    // Default Clean Start
    stations = {
        "station-1": { time: 0, interval: null, isLocked: true },
        "station-2": { time: 0, interval: null, isLocked: true },
        "station-3": { time: 0, interval: null, isLocked: true },
    };
    saveData(); // Create the file
}

io.on('connection', (socket) => {
    // 1. REGISTRATION
    socket.on('register_station', (stationId) => {
        // Allow dynamic registration if station doesn't exist yet
        if (!stations[stationId]) {
            stations[stationId] = { time: 0, interval: null, isLocked: true };
            saveData();
        }

        socket.join(stationId);
        
        // Send current status immediately
        io.to(stationId).emit('sync_status', {
            isLocked: stations[stationId].isLocked,
            secondsRemaining: stations[stationId].time
        });
        
        // Also update the Admin Panel so it sees the new station
        broadcastAdminUpdate();
    });

    // 2. ADD TIME
    socket.on('request_add_time', (data) => {
        const { target, minutes } = data;
        const station = stations[target];

        if (station) {
            station.time += (minutes * 60);
            station.isLocked = false;
            
            saveData(); // SAVE STATE
            io.to(target).emit('command_unlock');
            
            if (!station.interval) startStationTimer(target);
            broadcastAdminUpdate(); 
        }
    });

    // 3. TOGGLE LOCK
    socket.on('request_toggle_lock', (data) => {
        const { target, action } = data;
        const station = stations[target];

        if (station) {
            if (action === 'lock') {
                station.isLocked = true;
                stopStationTimer(target);
                io.to(target).emit('command_lock');
            } else {
                station.isLocked = false;
                stopStationTimer(target);
                io.to(target).emit('command_unlock');
            }
            saveData(); // SAVE STATE
            broadcastAdminUpdate();
        }
    });
    
    // 4. Force Admin Refresh
    socket.on('admin_connect', () => broadcastAdminUpdate());
});

// --- HELPER: SAVE TO DISK ---
function saveData() {
    // We create a "clean" copy because we can't save the 'interval' function to JSON
    const cleanData = {};
    for (const [id, data] of Object.entries(stations)) {
        cleanData[id] = {
            time: data.time,
            isLocked: data.isLocked
            // We do NOT save 'interval' (it's internal memory)
        };
    }
    
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(cleanData, null, 2));
    } catch (err) {
        console.error("Error saving data:", err);
    }
}

// --- TIMER ENGINE ---
function startStationTimer(stationId) {
    const station = stations[stationId];
    if (station.interval) clearInterval(station.interval);

    station.interval = setInterval(() => {
        if (station.time > 0) {
            station.time--;
            
            // OPTIMIZATION: Only save to disk every 5 seconds to save performance
            // (But we always update the client every second)
            if (station.time % 5 === 0) saveData(); 

            io.to(stationId).emit('timer_update', { secondsRemaining: station.time });
            
            // Send tick to admin for live view
            if(station.time % 1 === 0) io.emit('admin_timer_tick', { id: stationId, time: station.time });
            
        } else {
            stopStationTimer(stationId);
            station.isLocked = true;
            io.to(stationId).emit('command_lock');
            saveData(); // Final save
            broadcastAdminUpdate();
        }
    }, 1000);
}

function stopStationTimer(stationId) {
    const station = stations[stationId];
    if (station.interval) clearInterval(station.interval);
    station.interval = null;
    station.time = 0;
    io.to(stationId).emit('timer_update', { secondsRemaining: 0 });
}

function broadcastAdminUpdate() {
    const updateData = {};
    for (const [id, data] of Object.entries(stations)) {
        updateData[id] = { 
            isLocked: data.isLocked, 
            timeLeft: data.time 
        };
    }
    io.emit('admin_update', updateData);
}

server.listen(3000, () => {
    console.log('🧠 Brain (with Memory) running on port 3000');
});