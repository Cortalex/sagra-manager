const pool = require('../config/db'); 

// Select
exports.getIngredienti = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ingredienti ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server per tabella Ingredienti" });
    }
};

// Insert
exports.createIngrediente = async (req, res) => {
    try {
        const { nome_ingrediente, prezzo, quantita } = req.body; 
        
        if (!nome_ingrediente || nome_ingrediente.trim() === "") {
            return res.status(400).json({ errore: "Il nome ingrediente è obbligatorio" });
        }

        const result = await pool.query(
            'INSERT INTO ingredienti (nome_ingrediente, prezzo, quantita) VALUES ($1, $2, $3) RETURNING *',
            [nome_ingrediente, prezzo || 0, quantita || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(409).json({ errore: "Questo ingrediente esiste già" });
        res.status(500).json({ errore: "Errore durante la creazione del nuovo ingrediente" });
    }
};

// Update
exports.updateIngrediente = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_ingrediente, prezzo, quantita } = req.body;
        
        const result = await pool.query(
            'UPDATE ingredienti SET nome_ingrediente = COALESCE($1, nome_ingrediente), prezzo = COALESCE($2, prezzo), quantita = COALESCE($3, quantita) WHERE id = $4 RETURNING *',
            [nome_ingrediente, prezzo, quantita, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ errore: "Ingrediente non trovato" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(409).json({ errore: "Questo ingrediente esiste già" });
        res.status(500).json({ errore: "Errore durante l'aggiornamento dell'ingrediente" });
    }
};

// Delete
exports.deleteIngrediente = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM ingredienti WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Ingrediente non trovato" });
        }

        res.json({ messaggio: "Ingrediente eliminato con successo!" });
    } catch (err) {
        console.error(err.message);
        if (err.code === '23503') return res.status(409).json({ errore: "Impossibile eliminare: ingrediente in uso da qualche articolo." });
        res.status(500).json({ errore: "Errore durante l'eliminazione" });
    }
};