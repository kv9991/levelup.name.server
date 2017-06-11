var express = require('express')
var router = express.Router()
var validation = require('../validation/page')

var Page = require('../models/page')

router.post('/add', function (req, res) {
	var inputs = req.body;
	var validate = validation.add(inputs);	
	if(validate.success) {
		Page.create(inputs, function (err, page) {
		  if (err) return console.log(err);
		  res.json({ 
		    	success: true,
		    	message: 'Страница успешно добавлена',
		    	data: page
		    });
		})
	} else {
		res.json({ 
	    	success: false,
	    	errors: validate.errors
	    });
	}
});

router.get('/entries/:id/remove', function(req, res) {
	Page.findOne({_id: req.params.id}).remove(function(err) {
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


router.get('/entries/:slug?', function(req, res) {
	if(req.params.slug) {
		Page.findOne({ slug: req.params.slug })
		.select(['-__v'])
		.exec(function(err, pages) {
			if(!err) {
		  		res.json(pages);
		  	} else {
		  		res.json(err)
		  	}
		})
	} else {
		Page.find(function(err, pages) {
		  	if(!err) {
		  		res.json(pages);
		  	} else {
		  		res.json(err)
		  	}
		})
	}
})

router.post('/entries/:slug?/update', function(req, res) {
	var inputs = req.body;
	Page.update({ slug: req.params.slug }, { $set: inputs }, function(err, page) {
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

module.exports = router