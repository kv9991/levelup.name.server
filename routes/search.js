var express = require('express')
var router = express.Router()
var Post = require('../models/post')
var Tag  = require('../models/tag')
var Blog = require('../models/blog')
var User  = require('../models/user')
var config = require('../config'); 

router.get('/entries', function(req, res) {
	var querystr = req.query.query
	Post.find({$text: {$search: querystr}, 'postType': 'post'}, function(err, posts) {
		User.find({$text: {$search: querystr}}, function(err, users) {
			Tag.find({$text: {$search: querystr}} , function(err, tags) {
				Blog.find({$text: {$search: querystr}}, function(err, blogs) {
					res.json({
						posts: posts,
						users: users,
						blogs: blogs
					})
				})
			})
		})
	})
});   


module.exports = router;