var express       = require('express');
var app           = express();
var bodyParser    = require('body-parser');
var morgan        = require('morgan');
var mongoose      = require('mongoose'); 
var config        = require('./config'); 
var port          = config.port; 
var isLoggedIn    = require('./utils/isloggedin')
var cors          = require('cors')
var cookieParser  = require('cookie-parser')
var path          = require('path')
var fs            = require('fs')

// Route instances
var comment       = require('./routes/comment.js')
var module        = require('./routes/module.js')
var user          = require('./routes/user.js')
var post          = require('./routes/post.js')
var tag           = require('./routes/tag.js')
var appl          = require('./routes/app.js')
var search        = require('./routes/search.js')
var blog          = require('./routes/blog.js')
var social        = require('./routes/social.js')
var campaign      = require('./routes/campaign.js')
var advertisement = require('./routes/advertisement.js')

mongoose.connect(config.db.host);
app.set('superSecret', config.secret);
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/get', isLoggedIn);
app.use(cors({credentials: true}));

// Static files
app.use('/storage', express.static('uploads'));

app.use('/advertisement',  advertisement);
app.use('/campaign',  		 campaign);
app.use('/module',    		 module);
app.use('/comment',   		 comment);
app.use('/search',    		 search);
app.use('/social',    		 social);
app.use('/blog',      		 blog);
app.use('/user',      		 user);
app.use('/post',      		 post);
app.use('/app',       		 appl);
app.use('/tag',       		 tag);

// Setting Up
if (!fs.existsSync('uploads')) { 
	fs.mkdirSync('uploads')
}

app.listen(port);
console.log('> Сервер работает по адресу: http://localhost:' + port);
