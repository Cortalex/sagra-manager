const express = require('express');
const router = express.Router();
const categorieCtrl = require('../controllers/categorieCtrl');

// Se arriva una GET su /api/tipologie, esegui getTipologie
router.get('/', categorieCtrl.getCategorie);

// Se arriva una POST su /api/tipologie, esegui createTipologia
router.post('/', categorieCtrl.createCategoria);

// Se arriva una PUT su /api/tipologie/ID, esegui updateTipologia
router.put('/:id', tipologieCtrl.updateTipologia);

// Se arriva una DELETE su /api/tipologie/ID, esegui deleteTipologia
router.delete('/:id', tipologieCtrl.deleteTipologia);

module.exports = router;