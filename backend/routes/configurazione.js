const express = require('express');
const router = express.Router();
const ConfigurazioneCtrl = require('../controllers/configurazioneCtrl');

router.get('/', ConfigurazioneCtrl.getConfigurazione);

router.post('/', ConfigurazioneCtrl.createConfigurazione);

router.put('/:id', ConfigurazioneCtrl.updateConfigurazione);

router.delete('/:id', ConfigurazioneCtrl.deleteConfigurazione);

module.exports = router;