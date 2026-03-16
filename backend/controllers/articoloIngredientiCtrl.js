const pool = require('../config/db'); 

// Select
exports.getArticoloIngredienti = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articolo_ingredienti ORDER BY id_articolo ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server per tabella Articolo_Ingredienti" });
    }
};

// Insert
exports.createArticoloIngrediente = async (req, res) => {
    try {
        const { id_articolo, id_ingrediente, quantita_necessaria, obbligatorio } = req.body; 

        if (!id_articolo || !id_ingrediente) {
            return res.status(400).json({ errore: "ID Articolo e ID Ingrediente sono obbligatori" });
        }

        const result = await pool.query(
            'INSERT INTO articolo_ingredienti (id_articolo, id_ingrediente, quantita_necessaria, obbligatorio) VALUES ($1, $2, $3, $4) RETURNING *',
            [id_articolo, id_ingrediente, quantita_necessaria || 0, obbligatorio !== undefined ? obbligatorio : true]
        );
        
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(409).json({ errore: "Questa associazione articolo-ingrediente esiste già" });
        if (err.code === '23503') return res.status(400).json({ errore: "Articolo o Ingrediente non valido (chiave esterna mancante)" });
        res.status(500).json({ errore: "Errore durante la creazione dell'associazione" });
    }
};

// Update
exports.updateArticoloIngrediente = async (req, res) => {
    try {
        const { id_articolo, id_ingrediente } = req.params;
        const { quantita_necessaria, obbligatorio } = req.body;

        const query = `
            UPDATE articolo_ingredienti 
            SET 
                quantita_necessaria = COALESCE($1, quantita_necessaria), 
                obbligatorio = COALESCE($2, obbligatorio) 
            WHERE id_articolo = $3 AND id_ingrediente = $4
            RETURNING *`;

        const result = await pool.query(query, [quantita_necessaria, obbligatorio, id_articolo, id_ingrediente]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Associazione articolo-ingrediente non trovata" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore durante l'aggiornamento dell'associazione" });
    }
};

// Delete
exports.deleteArticoloIngrediente = async (req, res) => {
    try {
        const { id_articolo, id_ingrediente } = req.params;
        
        const result = await pool.query(
            'DELETE FROM articolo_ingredienti WHERE id_articolo = $1 AND id_ingrediente = $2 RETURNING *', 
            [id_articolo, id_ingrediente]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Associazione non trovata" });
        }

        res.json({ messaggio: "Associazione articolo-ingrediente eliminata con successo!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore durante l'eliminazione" });
    }
};