const express = require('express');
const router = express.Router();
const articoloIngredientiCtrl = require('../controllers/articoloIngredientiCtrl');

// GET: Recupera tutte le associazioni articoli-ingredienti
router.get('/', articoloIngredientiCtrl.getArticoloIngredienti);

// POST: Crea una nuova associazione articolo-ingrediente
router.post('/', articoloIngredientiCtrl.createArticoloIngrediente);

// PUT: Aggiorna un'associazione specifica (richiede entrambi gli ID)
// Esempio URL: /api/articolo-ingredienti/12/3 (articolo 12, ingrediente 3)
router.put('/:id_articolo/:id_ingrediente', articoloIngredientiCtrl.updateArticoloIngrediente);

// DELETE: Elimina un'associazione specifica (richiede entrambi gli ID)
router.delete('/:id_articolo/:id_ingrediente', articoloIngredientiCtrl.deleteArticoloIngrediente);

module.exports = router;