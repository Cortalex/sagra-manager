const pool = require('../config/db'); 

// Select
exports.getRigheOrdine = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM righe_ordine ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server per tabella Righe_Ordine" });
    }
};

// Insert
exports.createRigaOrdine = async (req, res) => {
    try {
        const { quantita, stato, prezzo_unitario, note, id_ordine, id_articolo } = req.body; 

        if (!id_ordine || !id_articolo) {
            return res.status(400).json({ errore: "ID Ordine e ID Articolo sono obbligatori" });
        }

        const query = `
            INSERT INTO righe_ordine (quantita, stato, prezzo_unitario, note, id_ordine, id_articolo) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`;

        const result = await pool.query(query, [
            quantita || 1, 
            stato || 'nuovo', 
            prezzo_unitario || 0, 
            note || '', 
            id_ordine, 
            id_articolo
        ]);
        
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        if (err.code === '23503') return res.status(400).json({ errore: "Ordine o Articolo inesistente (violazione chiave esterna)" });
        res.status(500).json({ errore: "Errore durante la creazione della riga d'ordine" });
    }
};

// Update
exports.updateRigaOrdine = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantita, stato, prezzo_unitario, note, id_ordine, id_articolo } = req.body;

        const query = `
            UPDATE righe_ordine 
            SET 
                quantita = COALESCE($1, quantita), 
                stato = COALESCE($2, stato), 
                prezzo_unitario = COALESCE($3, prezzo_unitario), 
                note = COALESCE($4, note),
                id_ordine = COALESCE($5, id_ordine),
                id_articolo = COALESCE($6, id_articolo)
            WHERE id = $7 
            RETURNING *`;

        const result = await pool.query(query, [quantita, stato, prezzo_unitario, note, id_ordine, id_articolo, id]);

        if (result.rows.length === 0) return res.status(404).json({ errore: "Riga ordine non trovata" });
        res.json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore durante l'aggiornamento della riga ordine" });
    }
};

// Delete
exports.deleteRigaOrdine = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM righe_ordine WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) return res.status(404).json({ errore: "Riga ordine non trovata" });
        res.json({ messaggio: "Riga ordine eliminata con successo!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore durante l'eliminazione della riga ordine" });
    }
};