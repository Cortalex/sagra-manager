const express = require('express');
const router = express.Router();
const scontiCtrl = require('../controllers/scontiCtrl');

router.get('/', scontiCtrl.getSconti);

router.post('/', scontiCtrl.createSconto);

router.put('/:id', scontiCtrl.updateSconto);

router.delete('/:id', scontiCtrl.deleteSconto);

module.exports = router;