var User        = require('./models/user'); 
var jwt         = require('jsonwebtoken')
var cookieParser= require('cookie-parser')

module.exports = function(app) {
	app.get('/', function(req, res) {
	    res.json({
	    	message: 'Hello World'
	    })
	});

	app.get('/users', function(req, res) {
	  User.find({}, function(err, users) {
	    res.json(users);
	  });
	});   

	app.get('/setup', function(req, res) {
	  var nick = new User({ 
	    name: 'kv9991', 
	    password: 'aerono',
	    admin: true,
	    token: null 
	  });

	  nick.save(function(err) {
	    if (err) throw err;
	    console.log('User saved successfully');
	    res.json({ success: true });
	  });
	});

	app.post('/auth', function(req, res) {
	  User.findOne({
	    name: req.body.name
	  }, function(err, user) {
	    if (err) throw err;
	    if (!user) {
	      res.json({ success: false, message: 'Authentication failed. User not found.' });
	    } else if (user) {
	      if (user.password != req.body.password) {
	        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
	      } else {
	        var token = jwt.sign(user, app.get('superSecret'), {
	          expiresIn : 60*60*24
	        });
	        User.findOneAndUpdate({name: user.name}, {token: token}, function(err) {
	        	if (!err) {
	        		res.json({
				        success: true,
				        token: token
			        });
	        	} else {
	        		res.json({
	        			success: false
	        		})
	        	}
	        })  
	      }   
	    }
	  });
	});

	app.get('/user/:nickname', function(req, res) {
		var query = User.where({name: req.params.nickname});
		query.findOne(function(err, user) {
			if(!err) {
				res.json(user)
			}
		});
	})

	app.get('/drop/:nickname', function(req, res) {
		User.find({name: req.params.nickname}).remove(function() {
			res.json({
				message: 'Removed!'
			})
		})
	})
}