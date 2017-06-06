var express = require('express')
var router = express.Router()
var Post = require('../models/post')
var Tag  = require('../models/tag')
var Comment  = require('../models/comment')
var User  = require('../models/user')
var jwt = require('jsonwebtoken')
var config = require('../config'); 

router.get('/entries/:slug', function(req, res) {
	var querystr = req.params.slug
	Post.find({$text: {$search: querystr}}, function(err, posts) {
		User.find({$text: {$search: querystr}}, function(err, users) {
			Tag.find({$text: {$search: querystr}} , function(err, tags) {
				res.json({
					posts: posts,
					users: users,
					tags : tags
				})
			})
		})
	})
});   


module.exports = router;