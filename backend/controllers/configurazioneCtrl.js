const pool = require('../config/db'); 

// Select
exports.getConfigurazione = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM configurazione ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server per tabella Configurazione" });
    }
};

// Insert
exports.createConfigurazione = async (req, res) => {
    try {
        const { nome_sagra, password, costo_coperto, costo_asporto, quantita_soglia, area, cassa } = req.body; 
        
        if (!nome_sagra) return res.status(400).json({ errore: "Il nome della sagra è obbligatorio" });

        const result = await pool.query(
            'INSERT INTO configurazione (nome_sagra, password, costo_coperto, costo_asporto, quantita_soglia, area, cassa) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [nome_sagra, password, costo_coperto || 0, costo_asporto || 0, quantita_soglia || 0, area, cassa]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore durante la creazione della nuova configurazione" });
    }
};

// Update
exports.updateConfigurazione = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_sagra, password, costo_coperto, costo_asporto, quantita_soglia, area, cassa} = req.body;
        
        const query = `
            UPDATE configurazione 
            SET 
                nome_sagra = COALESCE($1, nome_sagra), 
                password = COALESCE($2, password), 
                costo_coperto = COALESCE($3, costo_coperto), 
                costo_asporto = COALESCE($4, costo_asporto), 
                quantita_soglia = COALESCE($5, quantita_soglia), 
                area = COALESCE($6, area),
                cassa = COALESCE($7, cassa) 
            WHERE id = $8 
            RETURNING *`;

        const result = await pool.query(query, [nome_sagra, password, costo_coperto, costo_asporto, quantita_soglia, area, cassa,id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Configurazione non trovata" });
        }

        res.json(result.rows[0]); 
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore durante l'aggiornamento della configurazione" });
    }
};

// Delete
exports.deleteConfigurazione = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM configurazione WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Configurazione non trovata" });
        }

        res.json({ messaggio: "Configurazione eliminata con successo!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore interno durante l'eliminazione" });
    }
};