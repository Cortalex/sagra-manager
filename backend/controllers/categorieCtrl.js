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


// Update
exports.updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_categoria, visibile } = req.body;
        
        // Eseguiamo l'UPDATE
        const result = await pool.query(
            'UPDATE categorie SET nome_categoria = $1, visibile = $2 WHERE id = $3 RETURNING *',
            [nome_categoria, visibile, id]
        );

        // Se non trova nessuna riga con quell'ID
        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Categoria non trovata" });
        }

        res.json(result.rows[0]); // Restituisce la riga aggiornata
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore durante l'aggiornamento" });
    }
};

// Delete
exports.deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query('DELETE FROM categorie WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Categoria non trovata" });
        }

        res.json({ messaggio: "Categoria eliminata con successo!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Impossibile eliminare. La Categoria è in uso?" });
    }
};
