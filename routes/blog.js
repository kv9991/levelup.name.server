var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')
var config = require('../config'); 
var createSlug = require('../utils/createSlug.js')

var Blog = require('../models/blog')

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

router.post('/entries/add', function (req, res) {
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) {
			var inputs = req.body;
			inputs.slug = createSlug(inputs.blogTitle);
			// console.log(inputs)
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
			res.json({
				success: false,
				message: 'Неверный токен'
			})
		}
	});
});

router.get('/entries/:slug', function (req, res) {
	Blog.findOne({'slug' : req.params.slug}, function(err, blog) {
		res.json(blog)
	})
});





module.exports = router