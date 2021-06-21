var mysql = require('mysql');

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'msydor',
	password: 'msydor',
	port: 3306,
	database: 'Matcha'
});

connection.connect()

module.exports = connection;