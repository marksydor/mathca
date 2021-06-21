const express = require('express');
const router = express.Router();
const mysql = require('../config/database');
const session = require('express-session');
const md5 = require('md5');
const uniqid = require('uniqid');
const sendmail = require('sendmail')();
const multer  = require("multer");

//<<------- addPhotos ------>>
router.post("/addphotos", function (req, res, next) {
	if (req.session.user) {
		if (req.files.length > 5) {
			req.session.error = 'more then 5 photo'
			res.redirect('/profile?user=' + req.session.user);
		} else {
			//mysql.query("SELECT * FROM photos WHERE user_id= ?", )
			for (var i = 0; i < req.files.length; i++) {
				let path = '/uploads/' + req.files[i]['filename'];
				mysql.query("INSERT INTO photos (path, userName, time) VALUES (?, ?, ?)", [path, req.session.user, Date.now()], (err) => {
					if (err) {
						throw err;
					}
				});
			}
		}
		res.redirect('/profile?user=' + req.session.user);
	} else 
		res.redirect('/');
});
//<<------- addPhotos ------>>
// <<------ Additional ------>>
router.get('/aditional', (req, res) => {
	if (!req.session.user) {
		req.session.error = 'please login!'
		res.redirect('/');
	} else {
		res.render('aditional',{
			user: req.session.user
		});
	}
});


router.post("/aditional", function (req, res, next) {
	let files = req.files;
	mysql.query('UPDATE users SET age=?, gender=?, sexPer=?, biography=? WHERE userName=?', [req.body.age, req.body.gender, req.body.sexPer, req.body.biography, req.session.user], (err) => {
		if (err) {
			throw err;
		} else {
			res.redirect('/main');
		}
	});
});
// <<------ Additional ------>>
// <<------ Main page ------>>
router.get('/main', (req, res) => {
	if (!req.session.user) {
		req.session.error = 'please login!'
		res.redirect('/');
	} else {
		res.render('main',{
			user: req.session.user
		});
	}
});

// <<------ Main page ------>>

// <<------ Profile -------->>
router.get('/profile', (req, res) => {
	if (!req.session.user || !req.query.user) {
		req.session.error = 'please login!';
		res.redirect('/main');
	} else if (req.query.user) {
		mysql.query("SELECT * FROM users WHERE userName = ?", req.query.user, (err, result) => {
			if (err) {
				throw err;
			} else if (result[0] && result[0]['id']) {
				var status = ''
				if (req.session.user == result[0]['userName'])
					status = 'true';
				res.render('profile',{
					user: req.session.user,
					profile: result[0],
					status: status
				});
			} else {
				req.session.error = 'this user do not exist!'
				res.redirect('/main');
			}
		});
	}
});	

// <<------ Profile -------->>
// <<------ New Password ------>>

router.get('/newpassword', (req, res) => {
	if (!req.query.key) {
		res.redirect('/');
		req.session.error = 'bad key or old link';
	} else {
		req.session.newpassword = req.query.key;
		res.render('newpassword', {
			error: req.session.error
		});
		req.session.error = '';
	}
});

router.post('/newpassword', (req, res) => {
	if (req.body.password.length < 6 || req.body.password.length > 20) {
		req.session.error = 'password is to shoort or too long (6< password <20)';
		res.redirect('/newpassword?key=' + req.query.key);
	} else if (/[A-Z]/.test(req.body.password) == false || /[a-z]/.test(req.body.password) == false || /[A-Za-z0-9]/.test(req.body.password) == false) {
		req.session.error = "password should include numbers and lowercase and uppercase letters";
		res.redirect('/newpassword?key=' + req.session.newpassword);
	} else if (req.body.password != req.body.cpassword) {
		req.session.error = 'password do not much';
		res.redirect('/newpassword?key=' + req.session.newpassword);
	} else {
		mysql.query('SELECT * FROM users WHERE tempMail=?', req.session.newpassword, (err, result) =>{
			if (err) {
				throw err;
				req.session.error = err;
				res.redirect('/newpassword?key=' + req.session.newpassword);
			} else if (result[0] && result[0]['id']){
				mysql.query('UPDATE users SET password=? WHERE id=?', [md5('hop' + req.body.password + 'hey'), result[0]['id']], (err) => {
					if (err) {
						throw err;
						req.session.error = err;
						res.redirect('/newpassword?key=' + req.session.newpassword);
					} else {
						req.session.user = result[0]['userName'];
						req.session.newpassword = 0;
						if (result[0]['age'] == 0 || result[0]['age'] == '0')
							res.redirect('/aditional');
						else
							res.redirect('/main');
					}
				})
			} else {
				req.session.error = "old link";
				res.redirect('/');
			}
		});
	}
});

// <<------ New Password ------>>
// <<------ IF forgot Password ------>>
router.get('/forgot', (req, res) => {
	req.session.user = '';
	res.render('forgot', {
		error: req.session.error
	});
	req.session.error = '';
});

router.post('/forgot', (req, res) => {
	mysql.query('SELECT * FROM users WHERE userName=? AND mail=? AND confirmedMail=1', [req.body.userName, req.body.mail], (err, result) => {
		if (err) {
			throw error;
		} else if (result[0], result[0]['id']) {
			var hash = md5(uniqid('req.body.mail') + 'hop-hey');
			var url = req.protocol + '://' + req.get('host') + '/newpassword?key=' + hash;
			mysql.query('UPDATE users SET tempMail=?', hash, (err) => {
				if (err) {
					throw err;
					req.session.error = err;
					res.redirect('/');
				}
			});
			sendmail({
				from: 'matcha@matchamail',
				to: req.body.mail,
				subject: 'Forgot password',
				html:  '<h1>Hellow please create new password</h1><br><p>go to this link to create new password</p><a href="'+ url +'">click here</a>',
			}, (err, rep) => {
				if (err) {
					throw err;
					req.session.error = 'some wrong whith password';
					res.redirect('/');
				} else {
					req.session.error = 'check your mail';
					res.redirect('/');
				}
			});
		} else {
			req.session.error = 'can not find user with this mail or user name';
			res.redirect('/forgot');
		}
	});
});
// <<------ IF forgot Password ------>>
// <<------      Index     ------>>
router.get('/', (req, res) => {
	res.render('index', {
		error: req.session.error
	});
	req.session.error = '';
});


router.post('/', (req, res) => {
	req.session.user = '';
	mysql.query('SELECT * FROM users WHERE userName = ? AND password = ? AND confirmedMail =1', [req.body.userName, md5('hop' + req.body.password + 'hey')] , (error, result) => {
		if (error) {
			throw error;
			req.session.error = err;
			res.redirect('/');
		} else {
			if (result[0] && result[0]['id']) {
				mysql.query("UPDATE users SET online=1 WHERE userName = ?", req.body.userName, (err) => {
					if (err) {
						throw err;
					} 
				})
				req.session.user = req.body.userName;
				if (result[0]['age'] == 0 || result[0]['age'] == '0')
					res.redirect('/aditional');
				else
					res.redirect('/main');
			} else {
				mysql.query('SELECT * FROM users WHERE userName = ?', req.body.userName , (error, result) => {
					if (error) {
						throw error;
						req.session.error = err;
						res.redirect('/');
					}
					else if (result[0] && result[0]['id']) {
						mysql.query('SELECT * FROM users WHERE userName = ? AND confirmedMail =0',req.body.userName, (error, ressult) => {
							if (error) {
								throw error;
							} else if(ressult[0] && ressult[0]['id']) {
								req.session.error = 'not confirmed mail';
								res.redirect('/');
							} else {
								req.session.error = 'Bad password try again';
								res.redirect('/');	
							}
						});
					} else {
						req.session.error = 'This user do not exist';
						res.redirect('/');
					}
				});
			}
		}
	});
});
// <<------      Index     ------>>
// <<------ Create Account ------>>

router.get('/create', (req, res) => {
	req.session.user = '';
	res.render('create', {
		error: req.session.error
	});
	req.session.error = '';
});

router.post('/create', (req, res) => {
	mysql.query('SELECT * FROM users WHERE mail=? OR userName=?', [req.body.mail, req.body.userName], (error, row, result) => {
		if (error) {
			throw error;
		} else if (row[0] && row[0]['id']) {
			req.session.error = "user whith this mail already exist";
			res.redirect('/create');
		} else {
			if (req.body.firstName.length > 50 || req.body.userName.length > 50 || req.body.lastName.length > 50 || req.body.mail.length > 50 || req.body.password.length > 20) {
				req.session.error = "first name, last name, mail or password is too long";
				res.redirect('/create');
			} else if (req.body.firstName.length < 3 ||  req.body.lastName.length < 3 || req.body.mail.length < 6 || req.body.password.length < 6) {
				req.session.error = "first name, last name, mail or password is too short";
				res.redirect('/create');
			} else if (/[A-Z]/.test(req.body.password) == false || /[a-z]/.test(req.body.password) == false || /[0-9a-zA-Z]/.test(req.body.password) == false) {
				req.session.error = "password should include numbers and lowercase and uppercase letters";
				res.redirect('/create');
			} else if (/[a-zA-Z]/.test(req.body.firstName) == false || /[a-zA-Z]/.test(req.body.lastName) == false || /[0-9a-zA-Z]/.test(req.body.userName) == false) {
				req.session.error = "first name and last name should include only lowercase and uppercase letters";
				res.redirect('/create');
			}else if (req.body.password != req.body.confirm) {
				req.session.error = "passwords do not match";
				res.redirect('/create');
			} else {			
				var hash = md5(uniqid('req.body.mail') + 'hop-hey');
				var url = req.protocol + '://' + req.get('host') + '/confirm?key=' + hash;
				sendmail({
					from: 'matcha@matchamail',
					to: req.body.mail,
					subject: 'Confim your mail',
					html:  '<h1>Hellow please confirm your mail</h1><br><p>go this link to confirm</p><a href="'+ url +'">click here</a>',
				}, (err, rep) =>{
					if (err) {
						req.session.error = "something wrong with mail";
						res.redirect('/create');
					} else {
						mysql.query("INSERT INTO users (userName, firstName, lastName, mail, password, online, tempMail) VALUES (?, ?, ?, ?, ?, ?, ?)", [req.body.userName, req.body.firstName, req.body.lastName, req.body.mail, md5('hop' + req.body.password + 'hey'), false, hash], (error) =>
						{
							if (error) {
								throw error;
								req.session.error = err;
								res.redirect('/');
							} else {	
								req.session.error = "check your mail";
								res.redirect('/');
							}
						});
					}
				});
			}	
		}
	});
});
// <<------ Create Account ------>>
// <<------ Confirm Mail ------>>
router.get('/confirm', (req, res) => {
	if (!req.query.key)
		res.redirect('/');
	mysql.query('SELECT * FROM users WHERE confirmedMail = 0 AND tempMail=?', req.query.key, (err, result) => {
		if (err) {
			throw err;
		} else if(result[0] && result[0]['id']) {
			mysql.query('UPDATE users SET confirmedMail=1, tempMail="empty", online=1 WHERE tempMail=?', req.query.key, (err) => {
				if (err) {
					onsole.log(err);
					throw err;
				} 
			})
			req.session.user = result[0]['userName'];
			if (result[0]['age'] == 0 || result[0]['age'] == '0')
				res.redirect('/aditional');
			else
				res.redirect('/main');
		} else {
			res.redirect('/');
		}
	});
});
// <<------ Confirm Mail ------>>
// <<------    LogOut    ------>>
router.get('/logout', (req, res) => {
	mysql.query("UPDATE users SET online='0' WHERE mail=?", req.session.user, (error) =>
	{
	if (error) {
		throw error;
		req.session.error = err;
		res.redirect('/');
	}
	});
	req.session.user = '';
	res.redirect('/');
});
// <<------    LogOut    ------>>
module.exports = router;
