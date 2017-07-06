var express = require('express')
var router = express.Router()
var getValidate = require('../validation/comment.js')
var jwt = require('jsonwebtoken')
var config = require('../config'); 

var Post = require('../models/post')
var Comment = require('../models/comment')
var User = require('../models/user')

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

router.get('/entries/:id/remove', function(req, res) {
	var token = req.headers['authorization'] || false;
	var id = req.params.id;
	jwt.verify(token, config.secret, function(err, decoded) {
		if(err) { 
			return res.json({
				success: false,
				message: 'Неверный токен'
			})
		} else {
			Comment.findOne({'_id' : id}, function(err, comment) {
				User.findOne({'_id' : decoded.userID}, function(err, user) {
					if (user._id == comment.commentAuthor) {
						Comment.remove({'_id' : id}, function(err, mongodb) {
							res.json({
								success: true,
								message: 'Комментарий удалён!',
								mongodb: mongodb
							})
						})
					} else {
						res.json({
							success: false,
							message: 'Недостаточно прав для удаления!'
						})
					}
				})
			})
		}
	})
})

router.post('/entries/:id/update', function(req, res) {
	var token = req.headers['authorization'] || false;
	var inputs = req.body;
	var id = req.params.id;
	jwt.verify(token, config.secret, function(err, decoded) {
		if(err) { 
			return res.json({
				success: false,
				message: 'Неверный токен'
			})
		} else {
			Comment.findOne({'_id' : id}, function(err, comment) {
				User.findOne({'_id' : decoded.userID}, function(err, user) {
					if (user._id == comment.commentAuthor) {
						Comment.update({'_id' : id}, {$set: inputs}, {safe: true, upsert: false}, function(err, updatedComment) {
							res.json({
								success: true,
								message: 'Комментарий обновлён!',
								comment: updatedComment
							})
						})
					} else {
						res.json({
							success: false,
							message: 'Недостаточно прав для удаления!'
						})
					}
				})
			})
		}
	})
})



module.exports = router