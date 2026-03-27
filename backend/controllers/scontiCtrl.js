const pool = require('../config/db'); 

// Select
exports.getSconti = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sconti ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server per tabella Sconti" });
    }
};

// Insert
exports.createSconto = async (req, res) => {
    try {
        const { nome_sconto, valore, tipo, data_inizio, data_fine } = req.body; 
        
        if (!nome_sconto || valore === undefined || !tipo) {
            return res.status(400).json({ errore: "Nome sconto, valore e tipo sono obbligatori" });
        }

        if (data_inizio && data_fine) {
            if (new Date(data_inizio) > new Date(data_fine)) {
                return res.status(400).json({ errore: "La data di inizio non può essere successiva alla data di fine" });
            }

            if (new Date(data_fine) < new Date(data_inizio)) {
                return res.status(400).json({ errore: "La data di fine non può essere precedente alla data di inizio" });
            }
        }

        const result = await pool.query(
            'INSERT INTO sconti (nome_sconto, valore, tipo, data_inizio, data_fine) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nome_sconto, valore, tipo, data_inizio, data_fine]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);

        if (err.code === '23514') {
            return res.status(400).json({ errore: "La data di inizio deve essere precedente alla data di fine." });
        }
        res.status(500).json({ errore: "Errore durante la creazione del nuovo sconto" });
    }
};

// Update
exports.updateSconto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_sconto, valore, tipo, data_inizio, data_fine } = req.body; 
        
        if (data_inizio && data_fine && new Date(data_inizio) > new Date(data_fine)) {
            return res.status(400).json({ errore: "La data di inizio non può essere successiva alla data di fine" });
        }

        if (data_inizio && data_fine && new Date(data_fine) < new Date(data_inizio)) {
            return res.status(400).json({ errore: "La data di fine non può essere precedente alla data di inizio" });
        }        

        const query = `
            UPDATE sconti 
            SET 
                nome_sconto = COALESCE($1, nome_sconto), 
                valore = COALESCE($2, valore), 
                tipo = COALESCE($3, tipo), 
                data_inizio = COALESCE($4, data_inizio), 
                data_fine = COALESCE($5, data_fine) 
            WHERE id = $6 
            RETURNING *`;

        const result = await pool.query(query, [nome_sconto, valore, tipo, data_inizio, data_fine, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Sconto non trovato" });
        }

        res.json(result.rows[0]); 
    } catch (err) {
        console.error(err.message);
        if (err.code === '23514') {
            return res.status(400).json({ errore: "La data di inizio deve essere precedente alla data di fine." });
        }
        res.status(500).json({ errore: "Errore durante l'aggiornamento dello sconto" });
    }
};

// Delete
exports.deleteSconto = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM sconti WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Sconto non trovato" });
        }

        res.json({ messaggio: "Sconto eliminato con successo!" });
    } catch (err) {
        console.error(err.message);
        if (err.code === '23503') return res.status(409).json({ errore: "Impossibile eliminare: lo sconto è in uso." });
        res.status(500).json({ errore: "Errore durante l'eliminazione" });
    }
};