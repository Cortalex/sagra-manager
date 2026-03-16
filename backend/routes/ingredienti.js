const express = require('express');
const router = express.Router();
const ingredientiCtrl = require('../controllers/ingredientiCtrl');

router.get('/', ingredientiCtrl.getIngredienti);

router.post('/', ingredientiCtrl.createIngrediente);

router.put('/:id', ingredientiCtrl.updateIngrediente);

router.delete('/:id', ingredientiCtrl.deleteIngrediente);

module.exports = router;