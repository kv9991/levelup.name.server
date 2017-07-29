import express from 'express'
import * as isValid from '../validation/module'
import Module from '../models/module'
import jwt from 'jsonwebtoken'
import { success, error } from '../utils/response.js'
import config from '../config'

let router = express.Router()

// Get Modules
router.get('/entries/', (req, res) => {
	const { skip, limit } = req.query

	Module.find({}, {}, {
		skip: +skip || 0, 
		limit: +limit || 10, 
		sort: { 
			updated: -1
		}
	}, (err, modules) => {
		if(!err && modules.length > 0) {
			return res.status(200)
			.json(modules)
		} else {
			return res.status(500)
			.json(error(err, 'Ошибка при поиске модулей'))
		}
	})
})

// Create Module
router.post('/entries', (req, res) => {
	const newModule = req.body;
	const validation = isValid.create(newModule);	
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) {
			if(validation.success) {
				Module.create(newModule, (err, createdModule) => {
				  if(!err && module) {
				  	return res.status(200)
				  	.json(success('Модуль успешно добавлен', {
				  		createdModule
				  	}))
				  }
				})
			} else {
				return res.status(401)
				.json(error(validation.errors, 'Ошибки при заполнении полей'))
			}
		} else {
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	})
});

// Remove module
router.delete('/entries/:id', (req, res) => {
	const { id } = req.params;
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) {
			Module.findByIdAndRemove(id, (err, mongodb) => {
				if(!err && mongodb) {
					return res.status(200)
					.json(success('Модуль успешно удалён'))
				} else {
					return res.status(500)
					.json(error(err, 'Ошибка при удалении'))
				}
			})
		} else {
			res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	})
})

// Get Module By Slug
router.get('/entries/:slug', (req, res) => {
	const { slug } = req.params

	Module.findOne({ slug }, '-__v', (err, module) => {
		if(!err && module) {
			return res.status(200)
			.json(module)
		} else {
			return res.status(404)
			.json(error(err, 'Модуль не найден'))
		}
	})	
})

// Update Module
router.put('/entries/:id', (req, res) => {
	const { id } = req.params
	const newModule = req.body;
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) {
			Module.update({'_id': id}, {$set: newModule}, {upsert: true, safe: true}, (err, updatedModule) => {
				if(!err && updatedModule) {
		  		return res.status(200)
		  		.json(success('Модуль успешно обновлён', {
		  			updatedModule
		  		}))
		  	} else {
		  		return res.status(500)
					.json(error(err, 'Ошибка при обновлении модуля'))
		  	}
			})
		} else {
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	})
})

module.exports = router