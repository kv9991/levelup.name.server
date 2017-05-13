var express = require('express')
var router = express.Router()
var User = require('../models/user')
var jwt = require('jsonwebtoken')
var config = require('../config'); 
var validation = require('../validation/user')

router.get('/entries', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});   

router.post('/add', function (req, res) {
	var inputs = req.body;
	var validate = validation.add(inputs);	
	if(validate.success) {
		User.create(inputs, function (err, user) {
		  if (err) return console.log(err);
		  res.json({ 
		    	success: true,
		    	message: 'Пользователь успешно добавлен',
		    	data: user
		    });
		})
	} else {
		res.json({ 
	    	success: false,
	    	errors: validate.errors
	    });
	}
});

router.get('/auth', function(req, res) {
	var token = req.headers['authorization'] || false;
	console.log(token)
	if (token) { 
	    var decoded = jwt.verify(token, config.secret);
	    User.findOne({_id : decoded.userID}, function(err, user) {
	    	res.json(user);
	    })
	} else {
	    res.json(false);
	}
})

router.post('/auth', function(req, res) {
  User.findOne({
    slug: req.body.slug
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Пользователь не найден' });
    } else if (user) {
      if (user.userPassword != req.body.userPassword) {
        res.json({ success: false, message: 'Пароль неверный' });
      } else {
        var token = jwt.sign({ userID: user._id }, config.secret, {
          expiresIn : 60*60*24
        });
        User.findOne({slug: user.slug}, function(err, user) {
        	if (!err) {
        		res.json({
			        success: true,
			        user: {
			        	token: token
			        }
		        });
        	} else {
        		res.json({
        			success: false,
        			errors: err
        		})
        	}
        })  
      }   
    }
  });
});

router.get('/entries/:nickname', function(req, res) {
	var query = User.where({slug: req.params.nickname});
	query.findOne(function(err, user) {
		if(!err) {
			res.json(user)
		}
	});
})


router.get('/entries/:id/remove', function(req, res) {
	User.findOne({_id: req.params.id}).remove(function(err) {
		if(!err) {
			res.json({
				success: true,
				message: `Документ успешно удалён`
			})
		} else {
			res.json({
				success:false,
				message: err
			})
		}
	})
})


router.post('/entries/:slug?/update', function(req, res) {
	var inputs = req.body;
	User.update({ 'slug': req.params.slug }, { $set: inputs })
	.exec(function(err, pages) {
		if(!err) {
	  		res.json({
	  			success: true
	  		});
	  	} else {
	  		res.json({
	  			success: false,
	  			errors: err
	  		})
	  	}
	})
})

module.exports = router;