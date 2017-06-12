var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')
var config = require('../config'); 

// for uploading images
var formidable = require('formidable')
var util = require('util')
var path = require('path')
var fs = require('fs')
var randomString = require('../utils/randomString.js')
var getExtension = require('../utils/getExtension.js')

// Загрузка изображения
router.post('/entries/:id/upload', function (req, res) {
	var filename, dir, type, id;
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
					filename = randomString(16) + getExtension(file.type);
					dir = form.uploadDir + '/' + type + '/' + id;
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

module.exports = router