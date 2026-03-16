const pool = require('../config/db'); 

// Select
exports.getZone = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM zone ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server per tabella Zone" });
    }
};

// Insert
exports.createZona = async (req, res) => {
    try {
        const { nome_zona } = req.body; 
        
        if (!nome_zona || nome_zona.trim() === "") {
            return res.status(400).json({ errore: "Il nome della zona è obbligatorio" });
        }

        const result = await pool.query(
            'INSERT INTO zone (nome_zona) VALUES ($1) RETURNING *',
            [nome_zona]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(409).json({ errore: "Questa zona di stampa esiste già" });
        res.status(500).json({ errore: "Errore durante la creazione della nuova Area di stampa" });
    }
};

// Update
exports.updateZona = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_zona} = req.body;
        
        const result = await pool.query(
            'UPDATE zone SET nome_zona = COALESCE($1, nome_zona) WHERE id = $2 RETURNING *',
            [nome_zona, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Area di stampa non trovata" });
        }

        res.json(result.rows[0]); 
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(409).json({ errore: "Questa zona di stampa esiste già" });
        res.status(500).json({ errore: "Errore durante l'aggiornamento dell'Area" });
    }
};

// Delete
exports.deleteZona = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM zone WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Area di stampa non trovata" });
        }

        res.json({ messaggio: "Area di stampa eliminata con successo!" });
    } catch (err) {
        console.error(err.message);
        if (err.code === '23503') return res.status(409).json({ errore: "Impossibile eliminare l'area: è in uso da qualche articolo." });
        res.status(500).json({ errore: "Errore durante l'eliminazione" });
    }
};