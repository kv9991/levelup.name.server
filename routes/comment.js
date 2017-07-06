var express = require('express')
var router = express.Router()
var getValidate = require('../validation/comment.js')
var jwt = require('jsonwebtoken')
var config = require('../config'); 

var Post = require('../models/post')
var Comment = require('../models/comment')

router.get('/entries', function(req, res) {
  Comment.find({}, function(err, entries) {
    res.json(entries);
  });
});   

router.post('/entries/add', function (req, res) {
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret);
	if (token) {
		var inputs = req.body;
		var postID = inputs.commentPost;
		Comment.create(inputs, function (err, comment) {
		  	if (err) return console.log(err);
		  	Post.update({'_id' : postID}, {$push: { 'postComments': comment._id }}, {safe: true, upsert: true})
			  	.exec(function(err, post) {
			  		res.json({ 
				    	success: true,
				    	message: 'Комментарий успешно добавлен',
				    	comment: comment,
				    	post: post
				   });
			  	})
		  	})	
		} else {
			res.json({
				success: false,
				message: 'Неверный токен'
			})
		}
});

router.get('/entries/:id', function(req, res) {
	Comment.find({'commentPost': req.params.id})
	.populate('commentAuthor')
	.exec(function(err, comment) {
	    res.json(comment);
	});
})



module.exports = router