const express = require('express');
const router = express.Router();
const articoliCtrl = require('../controllers/articoliCtrl');

// Se arriva una GET su /api/tipologie, esegui getTipologie
router.get('/', articoliCtrl.getArticoli);

// Se arriva una POST su /api/tipologie, esegui createTipologia
router.post('/', articoliCtrl.createArticolo);

// Se arriva una PUT su /api/tipologie/ID, esegui updateTipologia
router.put('/:id', articoliCtrl.updateArticolo);

// Se arriva una DELETE su /api/tipologie/ID, esegui deleteTipologia
router.delete('/:id', articoliCtrl.deleteArticolo);

module.exports = router;