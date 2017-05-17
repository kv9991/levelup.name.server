var express = require('express')
var router = express.Router()
var Post = require('../models/post')
var jwt = require('jsonwebtoken')
var config = require('../config'); 
var validation = require('../validation/post')
var formidable = require('formidable')
var util = require('util')
var path = require('path')
var fs = require('fs')
var randomString = require('../utils/randomString.js')
var getExtension = require('../utils/getExtension.js')

router.get('/entries', function(req, res) {
  Post.find({}, function(err, entries) {
    res.json(entries);
  });
});   

router.post('/add', function (req, res) {
	var inputs = req.body;
	var validate = validation.add(inputs);
	if(validate.success) {
		Post.create(inputs, function (err) {
		  if (err) return console.log(err);
		  res.json({ 
		    	success: true,
		    	message: 'Пост успешно опубликован'
		    });
		})
	} else {
		res.json({ 
	    	success: false,
	    	errors: validate.errors
	    });
	}
});


router.get('/entries/:slug', function(req, res) {
	var query = Post.where({slug: req.params.slug});
	query.findOne(function(err, entry) {
		if(!err) {
			res.json(entry)
		}
	});
})


router.get('/entries/:id/remove', function(req, res) {
	Post.findOne({_id: req.params.id}).remove(function(err) {
		if(!err) {
			res.json({
				success: true,
				message: `Пост успешно удалён`
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
	var filename, dir, id;

	// Инициализируем парсер
	var form = new formidable.IncomingForm();
	form.parse(req)
	form.multiples = false;
	form.uploadDir = path.join(process.cwd(), '/uploads')
	form.keepExtensions = true;

	// Парсим storage-id поста
	form.on('field', function(field, value) {
		if (field == 'storage') {
			id = value
		}
    });
	
	// Парсим файл и переименовываем его
	form.on('file', function(field, file) {
		filename = randomString(16) + getExtension(file.type);
		dir = form.uploadDir + '/posts/' + id + '/';
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

router.post('/entries/:id/update', function(req, res) {
	var inputs = req.body;
	Post.update({ '_id': req.params.id }, { $set: inputs }, function(err, post) {
		if(!err) {
	  		res.json({
	  			success: true,
	  			post: post
	  		});
	  	} else {
	  		res.json({
	  			success: false,
	  			errors: err
	  		})
	  	}
	})
})


module.exports = router;