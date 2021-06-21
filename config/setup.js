const mysql = require('mysql');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'msydor',
	password: 'msydor',
	port: 3306

});

connection.connect();

connection.query('CREATE DATABASE IF NOT EXISTS Matcha')
console.log('Database Matcha created')
connection.query('USE Matcha')
connection.query('CREATE TABLE IF NOT EXISTS users (id INT NOT NULL AUTO_INCREMENT Primary key, userName VARCHAR(50) NOT NULL, firstName VARCHAR(50) NOT NULL, lastName VARCHAR(50) NOT NULL, mail VARCHAR(50) NOT NULL, password CHAR(129) NOT NULL, online BOOL DEFAULT FALSE, confirmedMail BOOL DEFAULT FALSE, tempMail VARCHAR(129) DEFAULT "empty", age INT DEFAULT 0, gender VARCHAR(10) DEFAULT "anouther", sexPer VARCHAR(10) DEFAULT "bisexual", biography TEXT, avatar VARCHAR(30)  DEFAULT "noavatar.png", rating INT DEFAULT 0);')
console.log('Table users created')
connection.query('CREATE TABLE IF NOT EXISTS mess (id_mes INT NOT NULL AUTO_INCREMENT Primary key, firstUser VARCHAR(50) NOT NULL, secondUser VARCHAR(50) NOT NULL, mess TEXT NOT NULL, time TEXT NOT NULL);')
console.log('Table mess created')
connection.query('CREATE TABLE IF NOT EXISTS photos (id_img INT NOT NULL AUTO_INCREMENT Primary key, path VARCHAR(50) NOT NULL, user_id INT NOT NULL, time TEXT NOT NULL);')
console.log('Table photos created')
connection.query('CREATE TABLE IF NOT EXISTS likes (id_like INT NOT NULL AUTO_INCREMENT Primary key, firstUser INT NOT NULL, secondUser INT NOT NULL, time TEXT NOT NULL);')
console.log('Table likes created')
// connection.query('CREATE TABLE IF NOT EXISTS images (id_img INT NOT NULL AUTO_INCREMENT Primary key, path VARCHAR(50) NOT NULL, userName VARCHAR(50) NOT NULL);')
// console.log('Table users created')

connection.end();