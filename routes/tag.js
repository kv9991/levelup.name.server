var express = require('express')
var router = express.Router()
var Tag = require('../models/tag')
var jwt = require('jsonwebtoken')
var config = require('../config'); 
// var validation = require('../validation/tag')

router.get('/entries', function(req, res) {
  /* Post.find({}, {}, {
	    skip:0, 
	    limit:10, 
	    sort:{ created: -1 }
	},
	function(err, entries) {
		res.json(entries);
	}); */

	Tag.find({}, function(err, tags) {
		res.json(tags);
	});

});   

module.exports = router;