const pool = require('../config/db'); 

// Select
exports.getCategorie = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorie ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server" });
    }
};

// Insert
exports.createCategoria = async (req, res) => {
    try {
        // req.body contiene i dati inviati dal frontend
        const { nome_categoria, visibile } = req.body; 
        
        const result = await pool.query(
            'INSERT INTO categorie (nome_categoria, visibile) VALUES ($1, $2) RETURNING *',
            [nome_categoria, visibile]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore durante la creazione" });
    }
};

