const pool = require('../config/db'); 

// Select
exports.getOrdini = async (req, res) => {
    try {
        // Spesso gli ordini si ordinano dal più recente (DESC)
        const result = await pool.query('SELECT * FROM ordini ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore del server per tabella Ordini" });
    }
};

// Insert (Transazione SQL: o tutto o niente)
exports.createOrdine = async (req, res) => {
    const client = await pool.connect(); 

    try {
        const { progressivo_giorno, numero_tavolo, coperti, totale, metodo_pagamento, righe } = req.body;
        
        await client.query('BEGIN'); 

        const queryOrdine = `
            INSERT INTO ordini (progressivo_giorno, numero_tavolo, coperti, totale, metodo_pagamento) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id`;
        
        const resOrdine = await client.query(queryOrdine, [progressivo_giorno, numero_tavolo, coperti, totale, metodo_pagamento]);
        
        const idOrdineNuovo = resOrdine.rows[0].id;

        const queryRiga = `
            INSERT INTO righe_ordine (id_ordine, id_articolo, quantita, prezzo_unitario, note) 
            VALUES ($1, $2, $3, $4, $5)`;

        for (let riga of righe) {
            await client.query(queryRiga, [
                idOrdineNuovo, 
                riga.id_articolo, 
                riga.quantita, 
                riga.prezzo_unitario, 
                riga.note || ''
            ]);
        }

        await client.query('COMMIT'); 
        
        // Manda al Monitor Cucina l'ID del nuovo ordine
        req.io.emit('nuovo_ordine_cucina', { 
            messaggio: "Nuovo ordine in arrivo!",
            id_ordine: idOrdineNuovo 
        });

        res.status(201).json({ 
            messaggio: "Ordine e righe salvati con successo!", 
            id_ordine: idOrdineNuovo 
        });

    } catch (err) {

        await client.query('ROLLBACK'); 
        console.error("Errore salvataggio ordine completo:", err.message);
        res.status(500).json({ errore: "Errore durante il salvataggio dell'ordine completo." });
    } finally {
        client.release(); 
    }
};

// Update
exports.updateOrdine = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            progressivo_giorno, nome_cliente, coperti, numero_tavolo, note, 
            metodo_pagamento, totale, resto, serata, date, ora, 
            stato, stampato, asporto, omaggio, id_sconto 
        } = req.body;

        const query = `
            UPDATE ordini 
            SET 
                progressivo_giorno = COALESCE($1, progressivo_giorno), 
                nome_cliente = COALESCE($2, nome_cliente), 
                coperti = COALESCE($3, coperti), 
                numero_tavolo = COALESCE($4, numero_tavolo), 
                note = COALESCE($5, note), 
                metodo_pagamento = COALESCE($6, metodo_pagamento), 
                totale = COALESCE($7, totale), 
                resto = COALESCE($8, resto), 
                serata = COALESCE($9, serata), 
                date = COALESCE($10, date), 
                ora = COALESCE($11, ora), 
                stato = COALESCE($12, stato), 
                stampato = COALESCE($13, stampato), 
                asporto = COALESCE($14, asporto), 
                omaggio = COALESCE($15, omaggio), 
                id_sconto = COALESCE($16, id_sconto)
            WHERE id = $17 
            RETURNING *`;

        const values = [
            progressivo_giorno, nome_cliente, coperti, numero_tavolo, note, 
            metodo_pagamento, totale, resto, serata, date, ora, 
            stato, stampato, asporto, omaggio, id_sconto, id
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) return res.status(404).json({ errore: "Ordine non trovato" });
        res.json(result.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ errore: "Errore durante l'aggiornamento dell'ordine" });
    }
};

// Delete
exports.deleteOrdine = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM ordini WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) return res.status(404).json({ errore: "Ordine non trovato" });
        res.json({ messaggio: "Ordine eliminato con successo!" });
    } catch (err) {
        console.error(err.message);
        if (err.code === '23503') return res.status(409).json({ errore: "Impossibile eliminare: ci sono righe ordine associate. Elimina prima quelle." });
        res.status(500).json({ errore: "Errore durante l'eliminazione dell'ordine" });
    }
};