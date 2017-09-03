var express = require('express')
var router = express.Router()
var Post = require('../models/post')
var Tag  = require('../models/tag')
var Blog = require('../models/blog')
var User  = require('../models/user')
var config = require('../config'); 

router.get('/entries', function(req, res) {
	var querystr = req.query.query
	Post.find({$text: {$search: querystr}, 'type': 'post'}, (err, posts) => {
		User.find({$text: {$search: querystr}}, (err, users) => {
			Blog.find({$text: {$search: querystr}}, (err, blogs) => {
				res.json({
					total: posts.length + users.length + blogs.length,
					posts: posts,
					users: users,
					blogs: blogs
				})
			})
		})
	})
});   

router.get('/entries/tags', function(req, res) {
	var querystr = req.query.query
	Tag.find({$text: {$search: querystr}} , function(err, tags) {
		res.json(tags)
	})
});  

router.get('/entries/blogs', function(req, res) {
	var querystr = req.query.query
	Blog.find({$text: {$search: querystr}} , function(err, blogs) {
		res.json({
			blogs: blogs
		})
	})
});  

router.get('/entries/posts', function(req, res) {
	var querystr = req.query.query
	Post.find({$text: {$search: querystr}} , function(err, posts) {
		res.json({
			posts: posts
		})
	})
});  

router.get('/entries/users', function(req, res) {
	var querystr = req.query.query
	User.find({$text: {$search: querystr}} , function(err, users) {
		res.json({
			users: users
		})
	})
});  


module.exports = router;