var express = require('express')
var router = express.Router()
var validation = require('../validation/module')

var Module = require('../models/module')

router.post('/add', function (req, res) {
	var inputs = req.body;
	var validate = validation.add(inputs);	
	if(validate.success) {
		Module.create(inputs, function (err, module) {
		  if (err) return console.log(err);
		  res.json({ 
		    	success: true,
		    	message: 'Модуль успешно добавлен',
		    	data: module
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
	Module.findOne({_id: req.params.id}).remove(function(err) {
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


router.get('/entries/', function(req, res) {
	Module.find({}, function(err, modules) {
		if(err) return res.json(false)
		res.json(modules)
	})
})

router.get('/entries/:slug', function(req, res) {
	Module.findOne({ slug: req.params.slug })
	.select(['-__v'])
	.exec(function(err, module) {
		if(!err) {
	  		res.json(module);
	  	} else {
	  		res.json(err)
	  	}
	})
})

router.post('/entries/:id/update', function(req, res) {
	console.log(req.body)
	Module.update({ '_id': req.params.id }, { $set: req.body }, function(err, module) {
		if(!err) {
	  		res.json({
	  			success: true,
	  			module: module
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