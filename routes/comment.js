var express = require('express')
var router = express.Router()
var getValidate = require('../validation/comment.js')
var jwt = require('jsonwebtoken')
var config = require('../config'); 

var Comment = require('../models/comment')

router.get('/entries', function(req, res) {
  Comment.find({}, function(err, entries) {
    res.json(entries);
  });
});   

router.post('/entries/add', function (req, res) {
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret);
	if(token) {
		var inputs = req.body;
		var validate = getValidate(inputs);	
		if(validate.success) {
			Comment.create(inputs, function (err) {
			  if (err) return console.log(err);
			  res.json({ 
			    	success: true,
			    	message: 'Комментарий успешно добавлен'
			    });
			})
		} else {
			res.json({ 
		    	success: false,
		    	errors: validate.errors
		    });
		}
	} else {
		res.json({
			success: false,
			message: 'Неверный токен'
		})
	}

});

router.get('/entries/:id', function(req, res) {
	Comment.find({ 'commentPost': req.params.id }, '-__v', function(err, comments) {
		if(!err) {
			res.json(comments)
		}
	})
})



module.exports = router