const pool = require('../config/db'); 

// Select
exports.getArticoli = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articoli ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server per tabella Articoli" });
    }
};

// Insert
exports.createArticolo = async (req, res) => {
    try {
        const { nome_articolo, prezzo, id_categoria, id_zona } = req.body; 

        if (!nome_articolo || nome_articolo.trim() === "") {
            return res.status(400).json({ errore: "Il nome dell'articolo è obbligatorio" });
        }
        if (prezzo === undefined || typeof prezzo !== 'number') {
            return res.status(400).json({ errore: "Il prezzo deve essere un numero valido" });
        }
        if (!id_categoria || !id_zona) {
            return res.status(400).json({ errore: "Categoria e Zona sono obbligatorie" });
        }

        const result = await pool.query(
            'INSERT INTO articoli (nome_articolo, prezzo, id_categoria, id_zona) VALUES ($1, $2, $3, $4) RETURNING *',
            [nome_articolo, prezzo, id_categoria, id_zona]
        );
        
        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error("DB Error:", err.message);
        if (err.code === '23505') {
            return res.status(409).json({ errore: "Un articolo con questo nome esiste già" });
        }
        res.status(500).json({ errore: "Errore interno durante la creazione dell'articolo" });
    }
};

// Update
exports.updateArticolo = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_articolo, prezzo, id_categoria, id_zona } = req.body;

        if (!id) return res.status(400).json({ errore: "ID articolo mancante" });

        // Aggiunto controllo sul prezzo se viene fornito
        if (prezzo !== undefined && typeof prezzo !== 'number') {
            return res.status(400).json({ errore: "Il prezzo deve essere un numero valido" });
        }

        const query = `
            UPDATE articoli 
            SET 
                nome_articolo = COALESCE($1, nome_articolo), 
                prezzo = COALESCE($2, prezzo), 
                id_categoria = COALESCE($3, id_categoria), 
                id_zona = COALESCE($4, id_zona) 
            WHERE id = $5 
            RETURNING *`;

        const result = await pool.query(query, [nome_articolo, prezzo, id_categoria, id_zona, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Articolo non trovato" });
        }

        res.json({ messaggio: "Articolo aggiornato con successo", articolo: result.rows[0] });

    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(409).json({ errore: "Un articolo con questo nome esiste già" });
        res.status(500).json({ errore: "Errore durante l'aggiornamento dell'articolo" });
    }
};

// Delete
exports.deleteArticolo = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM articoli WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ errore: "Articolo non trovato" });
        }

        res.json({ messaggio: "Articolo eliminato con successo!" });
    } catch (err) {
        console.error(err.message);
        // 23503 è l'errore di violazione Foreign Key in PostgreSQL
        if (err.code === '23503') return res.status(409).json({ errore: "Impossibile eliminare l'articolo: è presente in un ordine attivo." });
        res.status(500).json({ errore: "Errore del server durante l'eliminazione" });
    }
};