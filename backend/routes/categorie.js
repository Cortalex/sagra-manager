const express = require('express');
const router = express.Router();
const categorieCtrl = require('../controllers/categorieCtrl');

// Se arriva una GET su /api/tipologie, esegui getTipologie
router.get('/', categorieCtrl.getCategorie);

// Se arriva una POST su /api/tipologie, esegui createTipologia
router.post('/', categorieCtrl.createCategoria);

module.exports = router;