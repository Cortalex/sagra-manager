const express = require('express');
const router = express.Router();
const zoneCtrl = require('../controllers/zoneCtrl');

router.get('/', zoneCtrl.getZone);

router.post('/', zoneCtrl.createZona);

router.put('/:id', zoneCtrl.updateZona);

router.delete('/:id', zoneCtrl.deleteZona);

module.exports = router;