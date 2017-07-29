import express from 'express'
import jwt from 'jsonwebtoken'
import config from '../config' 
import User from '../models/user.js'
import mongoose from 'mongoose'
import capitalize from '../utils/capitalizeString.js'
import { success, error } from '../utils/response.js'

// for uploading images
import formidable from 'formidable'
import util from 'util'
import path from 'path'
import fs from 'fs'
import randomString from '../utils/randomString.js'
import getExtension from '../utils/getExtension.js'

let router = express.Router()

// Загрузка изображения
router.post('/entries/:id?/upload', (req, res) => {
	let filename, dir, type, id, storage, partialPath;
	const token = req.headers['authorization'] || false;
	
	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) { 
			let form = new formidable.IncomingForm();
			form.parse(req)
			form.multiples = false;
			form.uploadDir = path.join(process.cwd(), '/uploads')
			form.keepExtensions = true;

			form.on('field', (field, value) => {
				if(field == 'type') {
					type = value+'s'
				}
				if(field == 'id') {
					id = value
				}
			})

			// Парсим файл и переименовываем его
			form.on('file', (field, file) => {
				if(field == 'image') {
					partialPath = (!req.params.id) ? 
					'/users/' + decoded.userID :
				  '/' + type + '/' + id;
				  dir = form.uploadDir + partialPath

					filename = randomString(16) + getExtension(file.type);
					if (!fs.existsSync(dir)) {
						fs.mkdirSync(dir)
					}
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
						res.status(200)
						.json({
							filepath: config.storage + partialPath + '/' + filename,
							filename: filename,
							success: true
						})
				} else {
					res.status(200)
					.json({
						success: false,
						errors: err
					})
				}
			});
		} else {
			res.status(200)
			.json({
				success: false,
				errors: err
			})
		}
	});
})

// Изоморфная подписка 
router.get('/entries/:id/subscribe/:type', (req, res) => {
	const { id, type } = req.params;
	const token        = req.headers['authorization'] || false;
	const model        = mongoose.models[capitalize(type)]
	const path         = 'subscriptions.' + type + 's';
	const options      = { safe: true, upsert: true }

	jwt.verify(token, config.secret, (err, decoded) => {
		const currentUser = decoded.userID;
		if(!err) {
			User.findById(currentUser, (err, user) => {
				const push = {
					$push : {
						[path]: id,
						subscribers: currentUser
					}
				}
				if(isSubscribed(user, type, id)) {
					User.findByIdAndUpdate(currentUser, push, options)
					.exec((err, user) => {
						if(!err) {
							res.status(200)
				  		.json(success('Подписка удалена'))
						} else {
							res.status(404)
				  		.send('Пользователь не найден')
						}
					})
				} else {
					const pull = {
						$pull : {
							subscribers: currentUser,
							[path]: id
						}
					}
					User.findByIdAndUpdate(currentUser, pull, options)
					.exec((err, user) => {
						if(!err) {
					  	model.findByIdAndUpdate(id, {$pull: {subscribers: currentUser}}, options, (err, user) => {
				  			if(!err) {
				  				res.status(200)
				  				.json(success('Подписка удалена'))
				  			} else {
				  				res.status(204)
				  				.json(error(err, 'Ошибка при обновлении пользователя'))
				  			}
					  	})
					  } else {
					  	res.status(404)
					  	.json(error(err, 'Пользователь не найден'))
					  }
					})
				}
			});
		} else {
			res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	})
})

function isSubscribed(user, type, id) {
	return user.subscriptions[type + 's'].indexOf(id) == -1
}


module.exports = router