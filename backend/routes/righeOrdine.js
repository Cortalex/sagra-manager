const express = require('express');
const router = express.Router();
const righeOrdineCtrl = require('../controllers/righeOrdineCtrl');

// GET: Recupera tutte le righe d'ordine
router.get('/', righeOrdineCtrl.getRigheOrdine);

// POST: Crea una nuova riga d'ordine
router.post('/', righeOrdineCtrl.createRigaOrdine);

// PUT: Aggiorna una riga d'ordine esistente tramite ID
router.put('/:id', righeOrdineCtrl.updateRigaOrdine);

// DELETE: Elimina una riga d'ordine tramite ID
router.delete('/:id', righeOrdineCtrl.deleteRigaOrdine);

module.exports = router;