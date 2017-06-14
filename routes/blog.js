var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')
var config = require('../config'); 
var createSlug = require('../utils/createSlug.js')

// for uploading images
var formidable = require('formidable')
var util = require('util')
var path = require('path')
var fs = require('fs')
var randomString = require('../utils/randomString.js')
var getExtension = require('../utils/getExtension.js')


var Blog = require('../models/blog')
var User = require('../models/user')

// Отдает записи по указанным параметрам (пагинация)
router.post('/entries', function(req, res) {
	var options = req.body;
	var query = {};

	Blog.find(query, {}, {
		skip: options.skip, 
		limit: options.perPage, 
		sort:{ updated: -1 }
	}, function(err, blogs) {
		res.json(blogs)
	})
});    

router.get('/entries', function(req, res) {
	Blog.find({}, function(err, blogs) {
		res.json(blogs)
	})
});  

// Добавляет запись
router.post('/entries/add', function (req, res) {
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) {
			var inputs = req.body;
			inputs.slug = createSlug(inputs.blogTitle);
			Blog.findOne({'blogOwner' : decoded.userID}, function(err, blog) {
				if(!blog) {
					if(inputs.slug) {
						Blog.create(inputs, function (err, blog) {
						  if (err) return console.log(err);
						  res.json({ 
						    	success: true,
						    	message: 'Блог успешно создан',
						    	blog: blog
						    });
						})
					} else {
						res.json({ 
					    	success: false,
					    	message: 'Неверное название блога'
					    });
					}
				} else {
					return res.json({
						success:false,
						message:'Вы не можете регистрировать более одного блога'
					})
				}
			})
		} else {
			res.json({
				success: false,
				message: 'Неверный токен'
			})
		}
	});
});

// Возвращает одну запись по системному имени
router.get('/entries/:slug', function (req, res) {
	Blog.findOne({'slug' : req.params.slug}, function(err, blog) {
		res.json(blog)
	})
});

router.get('/entries/removeall', function (req, res) {
	Blog.remove({})
})

// Обновление одного поля (Работает совместно с глобальным методом updateField())
router.post('/entries/:id/updatefield', function (req, res) {
	data = req.body;
	Blog.update({'_id' : req.params.id}, {[data.field] : data.value}, function(err) {
		if(!err) return res.json({ success: true })
		res.json(err)
	})
});

// Удаление по id
router.get('/entries/:id/remove', function (req, res) {
	Blog.remove({'_id' : req.params.id}, function(err) {
		if(err) return res.json(err)
		res.json({
			success:true,
			message:'Удалено'
		})
	})
});

router.get('/entries/:id/getstats', function(req, res) {
	Post.find({'postAuthor' : req.params.id}, function(err, posts) {
		User.findOne({'_id': req.params.id}, function(err, user) {
			if(err) { return res.json(err) }
			var likes = 0;
			posts.map((item) => {
				item.postLikes.map((item) => {
					likes++;
				})
			})
			Comment.find({'commentAuthor': req.params.id}, function(err, comments) {
				res.json({
					likes: likes,
					posts: posts.length,
					score: user.userScore,
					comments: comments.length,
					subscribers: user.userSubscribersCount
				})
			})
		})
	})
})

// Возвращает подписки пользователя (объекты блогов)
router.get('/entries/:id/getsubscriptions', function(req, res) {
	User.findById(req.params.id, function(err, user) {
		Blog.find({'_id' : { $in : user.userSubscriptions.blogs }}, function(err, blogs) {
			res.send(blogs)
		})
	})
})


module.exports = router