const express = require('express');
const router = express.Router();
const ordiniCtrl = require('../controllers/ordiniCtrl');

// GET: Recupera tutti gli ordini
router.get('/', ordiniCtrl.getOrdini);

// POST: Crea un nuovo ordine
router.post('/', ordiniCtrl.createOrdine);

// PUT: Aggiorna un ordine esistente tramite ID
router.put('/:id', ordiniCtrl.updateOrdine);

// DELETE: Elimina un ordine tramite ID
router.delete('/:id', ordiniCtrl.deleteOrdine);

module.exports = router;