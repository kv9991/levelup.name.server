var express = require('express')
var router = express.Router()
var Tag = require('../models/tag')
var User = require('../models/user')
var jwt = require('jsonwebtoken')
var config = require('../config'); 
var validation = require('../validation/tag')

var formidable = require('formidable')
var util = require('util')
var path = require('path')
var fs = require('fs')
var randomString = require('../utils/randomString.js')
var getExtension = require('../utils/getExtension.js')

router.get('/entries', function(req, res) {
	var options = req.query;

	Tag.find({}, {}, {
		skip: +options.skip, 
		limit: +options.perPage, 
		sort:{ updated: -1 }
	}, function(err, tags) {
		res.json(tags)
	})
}); 

router.get('/entries/:slug', function(req, res) {
	Tag.findOne({'slug': req.params.slug}, function(err, tag) {
		res.json(tag)
	})
})

router.get('/entries/:id/byuser', function(req, res) {
	User.findOne({'_id': req.params.id}, function(err, user) {
		Tag.find({'_id' : {$in: user.userSubscriptions.tags}}, function(err, tags) {
			res.json(tags)
		})
	})
})

router.get('/entries/:id/getsubscribers', function(req, res) {
	User.find({'userSubscriptions.tags': req.params.id}, function(err, users) {
		res.json(users)
	})
})

router.get('/:id/subscribe', function(req, res) {
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret);
	if(token) {
		User.findOne({ '_id': decoded.userID }, function(err, user) {

			if(user.userSubscriptions.tags.indexOf(req.params.id) == -1) {
				User.findOneAndUpdate({ '_id': decoded.userID }, {$push : {'userSubscriptions.tags' : req.params.id}}, { safe: true, upsert: true })
				.exec(function(err, pages) {
					if(!err) {
				  		Tag.findByIdAndUpdate(req.params.id, {$inc: { 'tagSubscribersCount': 1 }}, {upsert: true}, function(err, tag) {
				  			res.json({
					  			success: true,
					  			message: 'Подписка на тэг удалена'
					  		});
				  		})

				  		// Зачем это? Tag.findByIdAndUpdate(req.params.id, {$inc: { 'tagSubscribersCount': 1 }}, {upsert: true})
				  	} else {
				  		res.json({
				  			success: false,
				  			errors: err
				  		})
				  	}
				})
			} else {
				User.findOneAndUpdate({ '_id': decoded.userID }, {$pull : {'userSubscriptions.tags' : req.params.id}})
				.exec(function(err, pages) {
					if(!err) {
				  		Tag.findByIdAndUpdate(req.params.id, {$inc: { 'tagSubscribersCount': -1 }}, {upsert: true}, function(err, tag) {
				  			res.json({
					  			success: true,
					  			message: 'Подписка на тэг удалена'
					  		});
				  		})
				  	} else {
				  		res.json({
				  			success: false,
				  			errors: err
				  		})
				  	}
				})
			}
		});
	} else {
		res.json({
			success: false,
			message: 'Неверный токен'
		})
	}
})

router.post('/entries/add', function (req, res) {
	var inputs = req.body;
	var validate = validation.add(inputs);	
	if(validate.success) {
		Tag.create(inputs, function (err) {
		  if (err) return console.log(err);
		  res.json({ 
		    	success: true,
		    	message: 'Тэг успешно добавлен'
		    });
		})
	} else {
		res.json({ 
	    	success: false,
	    	errors: validate.errors
	    });
	}
});

router.post('/entries/:id/update', function(req, res) {
	var inputs = req.body;
	Tag.update({ '_id': req.params.id }, { $set: inputs })
	.exec(function(err, pages) {
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

router.get('/entries/:id/remove', function(req, res) {
	Tag.find({ '_id': req.params.id }).remove(function(err) {
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


router.post('/upload', function (req, res) {
	var filename, dir, slug;

	// Инициализируем парсер
	var form = new formidable.IncomingForm();
	form.parse(req)
	form.multiples = false;
	form.uploadDir = path.join(process.cwd(), '/uploads/tags/')
	form.keepExtensions = true;

	// Парсим storage-id поста
	form.on('field', function(field, value) {
		if (field == 'slug') {
			slug = value
		}
    });
	
	// Парсим файл и переименовываем его
	form.on('file', function(field, file) {
		filename = randomString(16) + getExtension(file.type);
		dir = form.uploadDir;
		if (!fs.existsSync(dir)){
		    fs.mkdirSync(dir);
		}
        fs.rename(file.path, dir + '/' + filename);
    });

	// Обрабатываем ошибки парсера
    form.on('error', function(err) {
		console.log('Ошибка при загрузке файла: \n' + err);
	});

    // Кидаем ответ после парсинга
    form.on('end', function(err, fields, files) {
    	if (!err) {
			res.json({
				filename: filename,
				success: true
			})
		} else {
			res.json({
				success: false,
				errors: err
			})
		}
	});
})

module.exports = router;