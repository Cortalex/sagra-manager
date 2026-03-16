const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carica il file .env

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

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


app.listen(PORT, () => {
    console.log(`Server Sagra Manager avviato su http://localhost:${PORT}`);
    console.log(`Premi CTRL+C nel terminale per spegnerlo.`);
});