const { Router } = require('express');
const router = Router();
const mysql = require('../config/database');
const session = require('express-session');
const profile = require('./profile.js');

router.get('/*', (req, res) => {
	res.send('TEST');
})

module.exports = router
