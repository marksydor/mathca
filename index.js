const	express = require('express');
const	path = require('path');
const	exphbs = require('express-handlebars');
const	mysql = require('./config/database');
const	session = require('express-session');
const	sendmail = require('sendmail')();
const	PORT = process.env.PORT || 3000;
const	multer  = require("multer");
const	index = require('./routes/index');
const	profile = require('./routes/profile');
const 	uniqid = require('uniqid');

const app = express();
const hbs = exphbs.create({
	defaultLayout: 'main',
	extname: 'hbs'
});

app.use(session({
	secret: 'pica pica',
	// saveUninitialized: true,
	// cookie: { secure: true }
}));

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');



app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null,path.join(__dirname+'/public/uploads'))
    },
    filename: (req, file, cb) =>{
        cb(null, req.session.user + uniqid() +'.' + file.mimetype.substring(file.mimetype.length - 3));
    }
})

const fileFilter = (req, file, cb) => {
	if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg"){
		cb(null, true);
	} else{
		cb(null, false);
	}
}


app.use(express.static(__dirname));
app.use(multer({storage:storageConfig, fileFilter: fileFilter}).array('photos', 5));

app.use('/', profile);
app.use('/create', profile);
app.use('/logout', profile);
app.use('/forgot', profile);
app.use('/newpassword', profile);
app.use('/confirm', profile);
// app.use(routes);
app.listen(PORT, () => {
	console.log('Server has been started...');
});

