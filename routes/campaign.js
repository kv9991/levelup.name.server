import express from 'express'
import Campaign from '../models/campaign'
import User from '../models/user'
import Blog from '../models/blog'
import jwt from 'jsonwebtoken'
import { success, error } from '../utils/response.js'
import config from '../config'
import isValid from '../validation/campaign.js'

let router = express.Router()

// Get Campaigns
router.get('/entries/', (req, res) => {
	const { skip, limit } = req.query

	Campaign.find({}, {}, {
		skip: +skip || 0, 
		limit: +limit || 10, 
		sort: { 
			updated: -1
		}
	}, (err, campaigns) => {
		if(!err) {
			return res.status(200)
			.json(campaigns)
		} else {
			return res.status(500)
			.json(error(err, 'Ошибка при поиске модулей'))
		}
	})
})

// Create Campaign
router.post('/entries', (req, res) => {
	const newCampaign = req.body;
	const validation = isValid.create(newCampaign);	
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) {
			if(validation.success) {
				Campaign.create(newCampaign, (err, createdCampaign) => {
				  if(!err && createdCampaign) {
				  	return res.status(200)
				  	.json(success('Рекламная кампания успешно создана', {
				  		campaign: createdCampaign
				  	}))
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

// Remove Campaign
router.delete('/entries/:id', (req, res) => {
	const { id } = req.params;
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) {
			Campaign.findByIdAndRemove(id, (err, mongodb) => {
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

// Get Campaign By Id
router.get('/entries/:id/byid', (req, res) => {
	const { id } = req.params

	Campaign.findOne({ '_id': id })
	.populate('placements.users', 'image fullName description slug rate')
	.populate('placements.blogs', 'image title description rate')
	.populate({path: 'advertisements', options: {
		  sort: { title: -1 }
	  }})
	.exec((err, campaign) => {
		if(!err && campaign) {
			return res.status(200)
			.json(campaign)
		} else {
			return res.status(404)
			.json(error(err, 'Кампания не найдена'))
		}
	})	
})

router.get('/entries/:id/placement', (req, res) => {
	const { id } = req.params;
	const { placementId, placementType } = req.query;
	const token = req.headers['authorization'] || false;

	if(placementId && placementType) {
		jwt.verify(token, config.secret, (err, decoded) => {
			if(!err && decoded.userID) {
				Campaign.findOne({ '_id': id }, (err, campaign) => {
					if(!err && campaign) {
						const path = 'placements.' + placementType + 's'
						if(campaign.placements[placementType + 's'].indexOf(placementId) == -1) {
							Campaign.update({ '_id': id }, { $push: {[path]: placementId} }, {upsert: true, safe: true})
							.exec((err, updatedCampaign) => {
								return res.status(200)
								.json(success('Площадка добавлена'))
							})
						} else {
							Campaign.update({ '_id': id }, { $pull: {[path]: placementId} }, {upsert: true, safe: true})
							.exec((err, updatedCampaign) => {
								return res.status(200)
								.json(success('Площадка добавлена'))
							})
						}
					} else {
						return res.status(404)
						.json(error(err, 'Кампания не найдена'))
					}
				})	
			} else {
				return res.status(401)
				.json(error(err, 'Неверный токен'))
			}
		})
	} else {
		return res.status(500)
		.json(error([], 'Не указаны ID и тип площадки'))
	}

	
})

// Update Campaign
router.put('/entries/:id', (req, res) => {
	const { id } = req.params
	const newCampaign = req.body;
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
			if(!err && decoded.userID) {
					Campaign.findByIdAndUpdate(id, {$set: newCampaign}, {upsert: true, safe: true}, (err, updatedCampaign) => {
						if(!err && updatedCampaign) {
			  		return res.status(200)
		  		.json(success('Кампания успешно обновлена', {
		  			campaign: {
		  				...updatedCampaign,
		  				...newCampaign
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

// TODO: support for blogs
router.get('/entries/:id/offers', (req, res) =>{
	const { id } = req.params;

	Campaign.findOne({'_id': id})
	.exec((err, campaign) => {
		if(!err && campaign) {
				User.find({}, (err, users) => {
					Blog.find({}, (err, blogs) => {
						return res.status(200)
						.json(users)
					})
				})
		} else {
			return res.status(404)
			.json(error(err, 'Кампания не найдена'))
		}
	})
})



module.exports = router