const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Carichiamo il file .env

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const categorieRoutes = require('./routes/categorie');

app.use('/api/categorie', categorieRoutes);


app.listen(PORT, () => {
    console.log(`Server Sagra Manager avviato su http://localhost:${PORT}`);
    console.log(`Premi CTRL+C nel terminale per spegnerlo.`);
});