var express = require('express')
var router = express.Router()
var Social = require('../models/social')
var User = require('../models/user')
var jwt = require('jsonwebtoken')
var config = require('../config'); 

// Get
router.get('/entries', (req, res) => {
	const { skip, limit, sort, sortBy, find, findBy, select, 
		populate, populationSelect } = req.query
	
	const options = {
		skip: +skip || 0, 
		limit: +limit || 10, 
		sort: {
			[sortBy || 'updated']: sort || -1
		}
	}

	const query = {
		[findBy || '']: find
	}

	const populationQuery = populate ? populate.map((item, i) => {
		return {
			path: item,
			select: populationSelect ? (populationSelect[i] || '') : ''
		}
	}) : ''
	

	Social.find(query, select, options)
	.populate(populationQuery || '')
	.exec((err, social) => {
		return res.json(social)
	})
}); 


// Create
router.post('/entries', (req, res) => {
	const token = req.headers['authorization'] || false;
	const { link, owner, title } = req.body;
	const social = {
		link, 
		owner, 
		title
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err) {
			Social.findOne({'title': social.title, 'owner': social.owner}, (err, doc) => {
				if(!doc) {
					Social.create(social, (err, social) => {
						if(!err) {
							User.update({'_id': social.owner}, {$push: {'socials': social._id}}, {safe: true, upsert: true}, (err, user) => {
								if(!err) {
									return res.json({
										success: true,
										social: social
									})
								} else {
									return res.json({
										success: false,
										message: 'Ошибка при обновлении пользователя',
										errors: err
									})
								}
							})
						} else {
							return res.json({
								success: false,
								message: 'Ошибка при создании документа',
								errors: err
							})
						}
					})
				} else {
					return res.json({
						success: false,
						message: 'Соц. сеть уже добавлена',
						errors: err
					})
				}
			})
		} else {
			return res.json({
				success: false,
				message: 'Неверный токен'
			})
		}
	})
}); 

// Get by id
router.get('/entries/:selector', (req, res) => {
	const selector = req.params.selector;
	const { select, populate, populationSelect, by } = req.query

	const query = {
		[by || '_id']: selector
	}
	const populationQuery = populate.map((item, i) => {
		return {
			path: item,
			select: populationSelect ? (populationSelect[i] || '') : ''
		}
	})

	Social.findOne(query, select)
	.populate(populationQuery)
	.exec((err, social) => {
		if(!err) {
			return res.json(social)
		} else {
			return res.json({
				success: false,
				message: 'Ошибка при поиске документа',
				errors: err
			})
		}
	})
}); 

// Remove
router.delete('/entries/:id', (req, res) => {
	const token = req.headers['authorization'] || false;
	const body = req.body;
	const id = req.params.id;
	const query = {
		['_id']: id
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err) {
			Social.remove(query, (err, social) => {
				if(!err) {
					User.update({'_id': decoded.userID}, {$pull: {'socials': id}}, {upsert: true, safe:true}, (error, user) => {
						if(!error) {
							return res.json({
								success: true,
								message: 'Документ успешно удалён'
							})
						} else {
							return res.json({
								success: false,
								message: 'Ошибка при обновлении информации о пользователе',
								errors: error
							})
						}
					})
				} else {
					return res.json({
						success: false,
						message: 'Ошибка при удалении документа',
						errors: err
					})
				}
			})
		} else {
			return res.json({
				success: false,
				message: 'Неверный токен'
			})
		}
	})
}); 

// Update
router.put('/entries/:id', (req, res) => {
	const token = req.headers['authorization'] || false;
	const id = req.params.id;
	const social = req.body;

	const options = {
		safe: true,
		upsert: true
	}
	const query = {
		['_id']: id
	}

	jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) {
			Social.update(query, social, options, (err, social) => {
				if(!err) {
					return res.json({
						success: true,
						message: 'Документ успешно обновлён'
					})
				} else {
					return res.json({
						success: false,
						message: 'Ошибка при обновлении документа',
						errors: err
					})
				}
			})
		} else {
			return res.json({
				success: false,
				message: 'Неверный токен'
			})
		}
	})
}); 

router.get('/removeall', (req, res) => {
	return Social.remove({}, () => {
		res.json('Готово')
	})
})
module.exports = router;