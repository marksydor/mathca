const express = require('express');
const router = express.Router();
const mysql = require('../config/database');
const session = require('express-session');

router.get('/', (req, res) => {
	res.render('index', {
		error: req.session.error
	});
	req.session.error = '';
});


router.post('/', (req, res) => {
	req.session.user = '';
	mysql.query('SELECT * FROM users WHERE mail = ? AND password = ?', [req.body.mail, req.body.password] , (error, result) => {
		if (error)
			console.log(error);
		else
		{
			if (result[0] && result[0]['id'])
			{
				req.session.user = req.body.mail;
				res.redirect('/main');
			}
			else
			{
				req.session.error = 'Bad password or login (mail)';
				res.redirect('/');
			}
		}
	});
});

module.exports = router;