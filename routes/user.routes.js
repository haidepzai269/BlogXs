const express = require('express');
const router = express.Router();
const { getUserMiniProfile } = require('../controllers/user.controller');

router.get('/hover/:username', getUserMiniProfile);

module.exports = router;
