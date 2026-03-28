const pool = require('../config/db'); 

// Select (Ordine + Righe + Ingredienti Extra)
exports.getOrdini = async (req, res) => {
    try {
        const query = `
            SELECT 
                o.id, o.progressivo_giorno, o.nome_cliente, o.coperti, o.numero_tavolo, 
                o.note AS note_ordine, o.metodo_pagamento, o.totale, o.resto, 
                o.serata, o."data", o.ora, o.stato, o.stampato, o.asporto, o.omaggio,
                
                COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'id_riga', ro.id,
                            'id_articolo', ro.id_articolo,
                            'nome_articolo', a.nome_articolo,
                            'quantita', ro.quantita,
                            'prezzo_unitario', ro.prezzo_unitario,
                            'note_riga', ro.note,
                            'stato_riga', ro.stato,
                            
                            'ingredienti_extra', COALESCE(
                                (SELECT json_agg(
                                    json_build_object(
                                        'id_ingrediente', roi.id_ingrediente,
                                        'nome_ingrediente', i.nome_ingrediente,
                                        'prezzo_aggiuntivo', roi.prezzo_aggiuntivo
                                    )
                                )
                                FROM righe_ordine_ingredienti roi
                                JOIN ingredienti i ON i.id = roi.id_ingrediente
                                WHERE roi.id_riga_ordine = ro.id), 
                            '[]'::json) -- Se non ci sono extra, array vuoto
                        )
                    )
                    FROM righe_ordine ro
                    LEFT JOIN articoli a ON a.id = ro.id_articolo
                    WHERE ro.id_ordine = o.id), 
                '[]'::json) AS righe

            FROM ordini o
            ORDER BY o.id DESC;
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error("Errore getOrdini:", err.message);
        res.status(500).json({ errore: "Errore del server durante il recupero degli ordini completi" });
    }
};

// Insert
// Insert Completo (Transazione SQL con Magazzino e Controlli)
exports.createOrdine = async (req, res) => {
    const client = await pool.connect(); 

    try {
        // 1. Estrazione dati dal Frontend (Ignoriamo totalmente il "totale" inviato)
        const { 
            progressivo_giorno, 
            numero_tavolo, 
            coperti = 0, 
            nome_cliente,
            note_ordine, // Note generali dell'ordine (es. "Fretta")
            metodo_pagamento, 
            resto = 0,
            asporto = false, 
            omaggio = false, 
            id_sconto = null, 
            righe 
        } = req.body;
        
        await client.query('BEGIN'); 

        // 2. Lettura Configurazioni e Sconti
        const queryConfig = `
            SELECT costo_coperto, costo_asporto, quantita_soglia, 
                   obbligo_nome_cliente, obbligo_numero_tavolo, obbligo_coperti 
            FROM configurazione LIMIT 1
        `;
        const resConfig = await client.query(queryConfig);
        const config = resConfig.rows[0] || { 
            costo_coperto: 0, costo_asporto: 0, quantita_soglia: 10,
            obbligo_nome_cliente: false, obbligo_numero_tavolo: false, obbligo_coperti: false
        };

        // 3. Validazioni Iniziali basate sulla Configurazione
        if (config.obbligo_nome_cliente && (!nome_cliente || nome_cliente.trim() === '')) {
            throw new Error("Il nome cliente è obbligatorio.");
        }
        if (config.obbligo_numero_tavolo && !asporto && (!numero_tavolo || numero_tavolo <= 0)) {
            throw new Error("Il numero del tavolo è obbligatorio per le consumazioni sul posto.");
        }
        if (config.obbligo_coperti && !asporto && (!coperti || coperti <= 0)) {
            throw new Error("Specificare il numero di coperti.");
        }

        let sconto = null;
        if (id_sconto) {
            const resSconto = await client.query('SELECT valore, tipo FROM sconti WHERE id = $1', [id_sconto]);
            if (resSconto.rows.length > 0) sconto = resSconto.rows[0];
        }

        let totale_calcolato = 0;
        const righeElaborate = []; 
        const ingredientiDaScalare = {}; // "Carrello" invisibile per il magazzino

        // 4. Ciclo di Calcolo Righe e Magazzino
        for (let riga of righe) {
            // A. Prezzo base articolo
            const resArticolo = await client.query('SELECT prezzo FROM articoli WHERE id = $1', [riga.id_articolo]);
            if (resArticolo.rows.length === 0) throw new Error(`Articolo ID ${riga.id_articolo} non trovato.`);
            
            let prezzo_base_articolo = resArticolo.rows[0].prezzo;
            let costo_totale_ingredienti = 0;
            let ingredientiExtraElaborati = [];

            // B. Magazzino: Ingredienti Base (La Ricetta)
            const queryIngredientiBase = `SELECT id_ingrediente, quantita_necessaria FROM articolo_ingrediente WHERE id_articolo = $1`;
            const resIngredientiBase = await client.query(queryIngredientiBase, [riga.id_articolo]);
            
            for (let ingBase of resIngredientiBase.rows) {
                const quantitaUsata = (ingBase.quantita_necessaria || 1) * riga.quantita;
                ingredientiDaScalare[ingBase.id_ingrediente] = (ingredientiDaScalare[ingBase.id_ingrediente] || 0) + quantitaUsata;
            }

            // C. Calcolo e Magazzino: Ingredienti Extra Selezionati
            if (riga.ingredienti_extra && riga.ingredienti_extra.length > 0) {
                const queryIngredientiExtra = `SELECT id, COALESCE(prezzo, 0) as prezzo FROM ingredienti WHERE id = ANY($1::int[])`;
                const resIngredientiExtra = await client.query(queryIngredientiExtra, [riga.ingredienti_extra]);
                
                for (let ingExtra of resIngredientiExtra.rows) {
                    costo_totale_ingredienti += ingExtra.prezzo;
                    
                    ingredientiExtraElaborati.push({
                        id_ingrediente: ingExtra.id,
                        prezzo_aggiuntivo: ingExtra.prezzo
                    });

                    // Aggiungiamo l'extra al magazzino
                    ingredientiDaScalare[ingExtra.id] = (ingredientiDaScalare[ingExtra.id] || 0) + (1 * riga.quantita);
                }
            }

            // D. Totale Riga
            let prezzo_riga_finito = prezzo_base_articolo + costo_totale_ingredienti;
            totale_calcolato += (prezzo_riga_finito * riga.quantita);

            righeElaborate.push({
                id_articolo: riga.id_articolo,
                quantita: riga.quantita,
                prezzo_unitario: prezzo_riga_finito, 
                note_riga: riga.note || '', // Note specifiche del piatto
                ingredienti_extra: ingredientiExtraElaborati
            });
        }

        // 5. Costi Fissi (Coperto/Asporto) e Sconti
        totale_calcolato += asporto ? config.costo_asporto : (coperti * config.costo_coperto);

        if (sconto) {
            if (sconto.tipo === 'percentuale' || sconto.tipo === '%') {
                totale_calcolato -= (totale_calcolato * (sconto.valore / 100));
            } else {
                totale_calcolato -= sconto.valore;
            }
        }

        if (omaggio) totale_calcolato = 0;
        if (totale_calcolato < 0) totale_calcolato = 0;
        totale_calcolato = Math.round(totale_calcolato);

        // ==========================================
        // 6. INSERIMENTO DATABASE
        // ==========================================

        // Inserimento Ordine (con CURRENT_TIMESTAMP e date/ore di Postgres)
        const queryOrdine = `
            INSERT INTO ordini (
                progressivo_giorno, nome_cliente, coperti, numero_tavolo, note, 
                metodo_pagamento, totale, resto, serata, "data", ora, asporto, omaggio, id_sconto
            ) 
            VALUES (
                $1, $2, $3, $4, $5, 
                $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_DATE, CURRENT_TIME, $9, $10, $11
            ) RETURNING id`;
            
        const resOrdine = await client.query(queryOrdine, [
            progressivo_giorno, nome_cliente, coperti, numero_tavolo, note_ordine, 
            metodo_pagamento, totale_calcolato, resto, asporto, omaggio, id_sconto
        ]);
        const idOrdineNuovo = resOrdine.rows[0].id;

        // Inserimento Righe e Ingredienti Extra
        const queryRiga = `
            INSERT INTO righe_ordine (id_ordine, id_articolo, quantita, prezzo_unitario, note) 
            VALUES ($1, $2, $3, $4, $5) RETURNING id`;
            
        const queryRigaIngrediente = `
            INSERT INTO righe_ordine_ingredienti (id_riga_ordine, id_ingrediente, prezzo_aggiuntivo) 
            VALUES ($1, $2, $3)`;

        for (let riga of righeElaborate) {
            const resRiga = await client.query(queryRiga, [
                idOrdineNuovo, riga.id_articolo, riga.quantita, riga.prezzo_unitario, riga.note_riga
            ]);
            const idRigaNuova = resRiga.rows[0].id;

            for (let ing of riga.ingredienti_extra) {
                await client.query(queryRigaIngrediente, [
                    idRigaNuova, ing.id_ingrediente, ing.prezzo_aggiuntivo
                ]);
            }
        }

        // ==========================================
        // 7. GESTIONE SCORTE MAGAZZINO E AVVISI
        // ==========================================
        const avvisiMagazzino = [];
        const queryUpdateMagazzino = `
            UPDATE ingredienti 
            SET quantita = COALESCE(quantita, 0) - $1 
            WHERE id = $2 
            RETURNING nome_ingrediente, quantita
        `;

        for (const [id_ingrediente, quantita_da_scalare] of Object.entries(ingredientiDaScalare)) {
            const resUpdate = await client.query(queryUpdateMagazzino, [quantita_da_scalare, id_ingrediente]);
            
            if (resUpdate.rows.length > 0) {
                const ingredienteAgg = resUpdate.rows[0];
                if (ingredienteAgg.quantita <= config.quantita_soglia) {
                    avvisiMagazzino.push(
                        `Attenzione: "${ingredienteAgg.nome_ingrediente}" in esaurimento! Ne rimangono solo ${ingredienteAgg.quantita} porzioni.`
                    );
                }
            }
        }

        await client.query('COMMIT'); 
        
        // 8. Evento Socket per Monitor Cucina
        req.io.emit('nuovo_ordine_cucina', { 
            messaggio: "Nuovo ordine in arrivo!",
            id_ordine: idOrdineNuovo,
            avvisi_magazzino: avvisiMagazzino.length > 0 ? avvisiMagazzino : null
        });

        res.status(201).json({ 
            messaggio: "Ordine salvato con successo!", 
            id_ordine: idOrdineNuovo,
            totale_reale: totale_calcolato,
            avvisi: avvisiMagazzino 
        });

    } catch (err) {
        await client.query('ROLLBACK'); 
        console.error("Errore salvataggio ordine:", err.message);
        res.status(500).json({ errore: err.message || "Errore durante il salvataggio." });
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