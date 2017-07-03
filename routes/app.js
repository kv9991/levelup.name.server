var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')
var config = require('../config'); 
var User = require('../models/user.js')
var mongoose = require('mongoose')
var capitalize = require('../utils/capitalizeString.js')

// for uploading images
var formidable = require('formidable')
var util = require('util')
var path = require('path')
var fs = require('fs')
var randomString = require('../utils/randomString.js')
var getExtension = require('../utils/getExtension.js')

// Загрузка изображения
router.post('/entries/:id?/upload', function (req, res) {
	var filename, dir, type, id, storage;
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) { 
			var form = new formidable.IncomingForm();
			form.parse(req)
			form.multiples = false;
			form.uploadDir = path.join(process.cwd(), '/uploads')
			form.keepExtensions = true;

			form.on('field', function(field, value) {
				if(field == 'type') { type = value+'s' }
				if(field == 'id')   { id = value }
			})

			// Парсим файл и переименовываем его
			form.on('file', function(field, file) {
					if(field == 'image') {
						if(req.params.id != null) {
							dir = form.uploadDir + '/' + type + '/' + id;
					   } else {
					    	dir = form.uploadDir + '/temp';
					   }
					   filename = randomString(16) + getExtension(file.type);
						if (!fs.existsSync(dir)) { fs.mkdirSync(dir) }
					   fs.rename(file.path, dir + '/' + filename);
					} 
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
		} else {
			res.json({
				success: false,
				errors: err
			})
		}
	});
})

// Изоморфная подписка 
router.get('/entries/:id/subscribe/:type', function(req, res) {
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret);
	if(token) {
		var Model = mongoose.models[capitalize(req.params.type)]
		User.findOne({ '_id': decoded.userID }, function(err, user) {
			var path = 'userSubscriptions.' + req.params.type + 's';
			var update = {};
			update[path] = req.params.id;
			if(user.userSubscriptions[req.params.type + 's'].indexOf(req.params.id) == -1) {
				User.update({ '_id': decoded.userID }, {$push : update}, { safe: true, upsert: true })
				.exec(function(err) {
					if(!err) {
						var path = req.params.type +'SubscribersCount';
						var count = {};
						count[path] = 1;
						Model.findByIdAndUpdate(req.params.id, {$inc: count}, {upsert: true}, function(err, user) {
				  			console.log(err, user)
				  			res.json({
					  			success: true,
					  			message: 'Подписка оформлена'
					  		});
				  		})
				  	} else {
				  		res.json({
				  			success: false,
				  			errors: err
				  		})
				  	}
				})
			} else {
				User.update({ '_id': decoded.userID }, {$pull : update})
				.exec(function(err, pages) {
					if(!err) {
						var path = req.params.type +'SubscribersCount';
						var count = {};
						count[path] = -1;
				  		Model.findByIdAndUpdate(req.params.id, {$inc: count}, {upsert: true}, function(err, user) {
				  			res.json({
					  			success: true,
					  			message: 'Подписка удалена'
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

module.exports = router