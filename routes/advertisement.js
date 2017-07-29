import express from 'express'
import Campaign from '../models/campaign'
import User from '../models/user'
import Advertisement from '../models/advertisement'
import jwt from 'jsonwebtoken'
import { success, error } from '../utils/response.js'
import config from '../config'
import isValid from '../validation/advertisement.js'

let router = express.Router()

// Get Campaigns
router.get('/entries/', (req, res) => {
	const { skip, limit } = req.query

	Advertisement.find({}, {}, {
		skip: +skip || 0, 
		limit: +limit || 10, 
		sort: { 
			updated: -1
		}
	}, (err, advertisement) => {
		if(!err) {
			return res.status(200)
			.json(advertisement)
		} else {
			return res.status(500)
			.json(error(err, 'Ошибка при поиске модулей'))
		}
	})
})

// Create Advertisement
router.post('/entries', (req, res) => {
	const newAdvertisement = req.body;
	const validation = isValid.create(newAdvertisement);	
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) {
			if(validation.success) {
				Advertisement.create(newAdvertisement, (err, createdAdvertisement) => {
				  if(!err && createdAdvertisement) {
				  	Campaign.findByIdAndUpdate(createdAdvertisement.campaign, {$push: { advertisements: createdAdvertisement._id }}, (err, updatedCampaign) => {
				  		if(!err) {
				  			return res.status(200)
						  	.json(success('Рекламное объявление успешно создано', {
						  		advertisement: createdAdvertisement
						  	}))
				  		} else {
				  			return res.status(500)
				  			.json(error(err, 'Ошибка при обновлении кампании'))
				  		}
				  	})
				  }
				})
			} else {
				return res.status(200)
				.json(error(validation.errors, 'Ошибки при заполнении полей'))
			}
		} else {
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	})
});

// Remove advertisement
router.delete('/entries/:id', (req, res) => {
	const { id } = req.params;
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) {
			Advertisement.findByIdAndRemove(id, (err, mongodb) => {
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

// Get advertisement By Id
router.get('/entries/:id/byid', (req, res) => {
	const { id } = req.params

	Advertisement.findOne({ '_id': id })
	.populate('camapign')
	.exec((err, advertisement) => {
		if(!err && advertisement) {
			return res.status(200)
			.json(advertisement)
		} else {
			return res.status(404)
			.json(error(err, 'Кампания не найдена'))
		}
	})	
})


// Update advertisement
router.put('/entries/:id', (req, res) => {
	const { id } = req.params
	const newAdvertisement = req.body;
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
			if(!err && decoded.userID) {
					Advertisement.findByIdAndUpdate(id, {$set: newAdvertisement}, {upsert: true, safe: true}, (err, updatedAdvertisement) => {
						if(!err && updatedAdvertisement) {
			  		return res.status(200)
		  		.json(success('Кампания успешно обновлена', {
		  			advertisement: {
		  				...updatedAdvertisement,
		  				...newAdvertisement
		  			}
		  		}))
		  	} else {
		  		return res.status(500)
					.json(error(err, 'Ошибка при обновлении кампании'))
		  	}
			})
		} else {
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	})
})



module.exports = router