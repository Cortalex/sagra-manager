const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');

const fs = require('fs');
const path = require('path');
const pool = require('./config/db');

// Carica il file .env
require('dotenv').config();

const app = express();

//Webserver
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" } // In produzione metterai l'IP esatto per sicurezza
});


const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    req.io = io;
    next();
});

const categorieRoutes = require('./routes/categorie');
const zoneRoutes = require('./routes/zone');
const scontiRoutes = require('./routes/sconti');
const ingredientiRoutes = require('./routes/ingredienti');
const configurazioneRoutes = require('./routes/configurazione');
const articoliRoutes = require('./routes/articoli');
const ordiniRoutes = require('./routes/ordini');
const righeOrdineRoutes = require('./routes/righeOrdine');
const articoloIngredientiRoutes = require('./routes/articoloIngredienti');

app.use('/api/categorie', categorieRoutes);
app.use('/api/zone', zoneRoutes);
app.use('/api/sconti', scontiRoutes);
app.use('/api/ingredienti', ingredientiRoutes);
app.use('/api/configurazione', configurazioneRoutes);
app.use('/api/articoli', articoliRoutes);
app.use('/api/ordini', ordiniRoutes);
app.use('/api/righe-ordine', righeOrdineRoutes);
app.use('/api/articolo-ingredienti', articoloIngredientiRoutes);


io.on('connection', (socket) => {
    console.log(`Nuovo dispositivo connesso al WebSocket (Monitor): ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`Dispositivo disconnesso: ${socket.id}`);
    });
});

const initDatabase = async () => {
    try {
        console.log('Controllo stato del database in corso...');
        const sqlPath = path.join(__dirname, 'database', 'init.sql'); 
        const sqlString = fs.readFileSync(sqlPath, 'utf8');
        
        await pool.query(sqlString);
        console.log('Tabelle verificate/create con successo!');
    } catch (err) {
        console.error('Errore critico durante la creazione delle tabelle:', err.message);
        process.exit(1); 
    }
};

initDatabase().then(() => {
    server.listen(PORT, () => {
        console.log(`Server Sagra Manager + WebSockets avviato su http://localhost:${PORT}`);
        console.log(`Premi CTRL+C nel terminale per spegnerlo.`);
    });
});