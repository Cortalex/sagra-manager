const pool = require('../config/db'); 

// Select
exports.getCategorie = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorie ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server per tabella Categorie" });
    }
};

// Insert
exports.createCategoria = async (req, res) => {
    try {
        const { nome_categoria, visibile } = req.body; 
        if (!nome_categoria || nome_categoria.trim() === "") {
            return res.status(400).json({ errore: "Il nome categoria è obbligatorio" });
        }

        const result = await pool.query(
            'INSERT INTO categorie (nome_categoria, visibile) VALUES ($1, $2) RETURNING *',
            [nome_categoria, visibile !== undefined ? visibile : true] 
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(409).json({ errore: "Questa categoria esiste già" });
        res.status(500).json({ errore: "Errore durante la creazione della categoria" });
    }
};

// Update
exports.updateCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_categoria, visibile } = req.body;
        
        const result = await pool.query(
            'UPDATE categorie SET nome_categoria = COALESCE($1, nome_categoria), visibile = COALESCE($2, visibile) WHERE id = $3 RETURNING *',
            [nome_categoria, visibile, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ errore: "Categoria non trovata" });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') return res.status(409).json({ errore: "Questa categoria esiste già" });
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
        if (err.code === '23503') return res.status(409).json({ errore: "Impossibile eliminare: ci sono articoli collegati a questa categoria." });
        res.status(500).json({ errore: "Errore durante l'eliminazione" });
    }
};