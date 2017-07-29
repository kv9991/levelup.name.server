var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Comment = require('../models/comment')
var User = require('../models/user')
var Post = require('../models/post')
var Blog = require('../models/blog')
import Campaign from '../models/campaign.js'
var jwt = require('jsonwebtoken')
var config = require('../config'); 
var validation = require('../validation/user')
import { success, error } from '../utils/response.js';

router.get('/entries', function(req, res) {
  var options = req.body;
	var query = {};
	User.find(query, {}, {
		skip: options.skip, 
		limit: options.perPage, 
		sort:{ updated: -1 }
	}, function(err, users) {
		res.json(users)
	})
});   

// Проверяет токен
router.get('/auth', (req, res) => {
	const token = req.headers['authorization'] || false;
	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err) {
	    User.findOne({_id : decoded.userID}, (err, user) => {
	    	res.status(200)
	    	.json(success('Пользователь авторизован', {
	    		user
	    	}))
	    })
		} else {
			res.status(200)
	    .json(error(err, 'Авторизация прошла неудачно'))
		}
	})
})

// Выдает токен при авторизации
router.post('/signin', function(req, res) {
	const { login, password } = req.body;
	User.findOne({'slug': login}, (err, user) => {
  	if (!user) {
  		res.status(200)
  		.json(error(err, 'Пользователь не найден'))
  	} else {
      if (user.password != password) {
        res.status(200)
    		.json(error(err, 'Неверный пароль'))
      } else {
      	var token = jwt.sign({ userID: user._id }, config.secret, {
        	expiresIn : 60*60*24*3
      	});
      	User.findOne({slug: user.slug}, function(err, user) {
        	if (!err) {
		      	res.status(200)
    				.json(success('Авторизация прошла успешно', {
    					token,
    					user
    				}))
        	} else {
        		res.status(200)
    				.json(error(err, 'Пользователь не найден'))
        	}
        })  
      }   
   	}
  });
});

// Выдает токен при авторизации
router.post('/signup', function(req, res) {
  var data = req.body;
	var valid = validation.signup(data);
	if (valid.success) {
		var user = {
			slug: data.login,
			fullName: data.fullName,
		  email: data.email,
		  gender: data.gender,
		  password: data.password,
		  description: data.description
		}	
		User.create(user, (err) => {
			if(!err) {
			  	res.status(200)
		    	.json(success('Регистрация прошла успешно'))
			} else {
				res.status(200)
	    	.json(error(err, 'Ошибка при создании пользователя'))
			}
		})
	} else {
		res.status(200)
	  .json(error(valid.errors, 'При регистрации возникли ошибки'))
	}
});

// Выдает пользователя по никнейму
router.get('/entries/:nickname', function(req, res) {
	User.findOne({'slug': req.params.nickname}, '-userPassword -__v')
	.populate('socials')
	.exec(function(err, user) {
		if(!err) {
			res.json(user)
		}
	})
})

router.get('/me', (req, res) => {
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) {
			User.findOne({'_id': decoded.userID}, '-password -__v')
			.populate('socials')
			.exec((err, user) => {
				if(!err && user) {
					return res.status(200)
					.json(user)
				} else {
					return res.status(404)
					.json(error(err, 'Пользователь не найден'))
				}
			})
		} else {
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	})
})

// Переделать на /entries/:id/byid
router.get('/entries/id/:id', function(req, res) {
	User.findOne({ '_id': req.params.id }, '-userPassword -__v', function(err, user) {
		if(!err) {
			res.json(user)
		}
	})
})

// Возвращает поле
router.get('/entries/:id/field/:field', function(req, res) {
	User.findOne({ '_id': req.params.id }, req.params.field, function(err, field) {
		if(!err) {
			res.json(field)
		}
	});
})

// Удаляет пользователя
router.get('/entries/:id/remove', function(req, res) {
	User.findOne({_id: req.params.id}).remove(function(err) {
		if(!err) {
			res.json({
				success: true,
				message: `Пользователь успешно удалён`
			})
		} else {
			res.json({
				success:false,
				message: err
			})
		}
	})
})

// Обновляет пользователя
router.post('/entries/:id/update', function(req, res) {
	var inputs = req.body;
	User.update({ '_id': req.params.id }, { $set: inputs })
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

// Обновляет одно поле
router.put('/entries/:id/field', (req, res) => {
	const { id } = req.params
	const { value, field } = req.body;
	User.update({'_id' : id}, {[field] : value}, (err, user) => {
		if(!err && user) {
			return res.status(200)
			.json(success('Поле успешно обновлено', {
				user
			}))
		} else {
			return res.status(500)
			.json(error(err, 'Ошибка при обновлении поля'))
		} 
	})
});

// Возвращает подписки пользователя (объекты пользователей)
router.get('/entries/:id/subscriptions/:type?', function(req, res) {
	if(req.params.type) {
		const { id, type } = req.params
		User.findById(id)
		.populate('subscriptions.' + type)
		.exec((err, user) => {
			if(!err) {
				return res.status(200)
				.json(user.subscriptions[type])
			} else {
				return res.status(404)
				.json(error(err, 'Ошибка при поиске подписок'))
			}
		})
	} else {
		const { id } = req.params;
		User.findById(id)
		.populate('subscriptions.blogs subscriptions.users subscriptions.tags')
		.exec((err, user) => {
			if(!err) {
				return res.status(200)
				.json(user.subscriptions)
			} else {
				return res.status(404)
				.json(error(err, 'Ошибка при поиске подписок'))
			}
		})
	}
})

// Добавляет соц сеть
router.post('/entries/:id/addsocial', function(req, res) {
	var inputs = req.body;
	var token = req.headers['authorization'] || false;
	jwt.verify(token, config.secret, function(err, decoded) {
		// добавить проверку на токен
		User.findOne({'_id': req.params.id}, function(err, user) {
			var index = -1;
			for(var i = 0, len = user.socials.length; i < len; i++) {
			    if (user.socials[i].title === inputs.title) {
			        index = i;
			        break;
			    }
			}
			if(index == -1) {
				if(decoded.userID == req.params.id) {
					User.findOneAndUpdate({'_id' : req.params.id}, {$push: {'socials' : { 'title': inputs.title, 'link': inputs.link} }}, {upsert:true, safe: true})
					.exec(function(err, pages) {
						if(!err) {
					  		res.json({
					  			success: true,
					  			message: 'Обновлено'
					  		});
					  	} else {
					  		res.json({
					  			success: false,
					  			errors: err
					  		})
					  	}
					})
				}
			} else {
				res.json({
					success: false,
					message: 'Уже существует'
				})
			}
		})
	})
})

// Добавить каждой соц сети уникальный id (передавать через POST)
// Удаляет соц сеть
router.post('/entries/:id/removesocial', function(req, res) {
	var social = req.body;
	var token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) { 
			User.findOne({'_id' : req.params.id }, function(err, user) {
				var index = -1;
				for(var i = 0, len = user.socials.length; i < len; i++) {
				    if (user.userSocials[i].title == social.title) {
				        index = i;
				        break;
				    }
				}
				User.update({'_id' : req.params.id}, {$pull : {'socials': {'title' : social.title}}}, {upsert: true, safe: true}, function(err, response) {
					res.json({
						success: true,
						message: 'Удаление прошло успешно'
					})
				})
			})
		} else {
			res.json({
				message: 'Неверный токен',
				success: false
			})
		}
	});

})

router.get('/entries/:id/getstats', function(req, res) {
	Post.find({'postAuthor' : req.params.id}, function(err, posts) {
		User.findOne({'_id': req.params.id}, function(err, user) {
			if(err) { return res.json(err) }
			var likes = 0;
			posts.map((item) => {
				item.likes.map((item) => {
					likes++;
				})
			})
			Comment.find({'author': req.params.id}, function(err, comments) {
				res.json({
					likes: likes,
					posts: posts.length,
					score: user.score,
					comments: comments.length,
					subscribers: user.subscribers.length
				})
			})
		})
	})
})

// Возвращает блог пользователя
router.get('/entries/:id/getblog', function(req, res) {
	Blog.findOne({'owner' : req.params.id}, function(err, blog) {
		if(!err) {
			res.json(blog)
		}
	})
})

// Возвращает маски пользователя
router.get('/entries/:id/getfaces', function(req, res) {
	var result = [];
	Blog.findOne({'owner' : req.params.id}, function(err, blog) {
		result.push(blog);
		Blog.find({'staff' : {$in: [req.params.id]}}, function(err, blogs) {
			if(!blogs) {
				return res.status(200)
				.json([])
			} else {
				return res.status(200)
				.json(blogs);
			}
		})
	})
})

router.get('/entries/:id/getposts', (req, res) => {
	const { id } = req.params;
	const { skip, limit } = req.query

	Post.find({'author.user': id, 'type' : 'post'}, {}, {
		skip: +skip, 
		limit: +limit, 
		sort:{ updated: -1 }
	})
	.populate('author.user')
	.exec((err, posts) => {
		if(!err && posts) {
			return res.status(200)
			.json(posts)
		} else {
			return res.status(404)
			.json(error(err, 'Посты не найдены'))
		}
	})
})

router.get('/entries/:id/getsubscriptions', (req, res) => {
	const { id } = req.params;
	const { skip, limit } = req.query

	User.findOne({'_id': id}, {}, {
		skip: +skip, 
		limit: +limit, 
		sort:{ updated: -1 }
	})
	.populate('subscriptions.users', 'fullName slug image description')
	.populate('subscriptions.tags', 'title image description slug')
	.populate('subscriptions.blogs', 'title slug image description')
	.exec((err, user) => {
		if(!err && user) {
			return res.status(200)
			.json(user.subscriptions)
		} else {
			return res.status(404)
			.json(error(err, 'Пользователь не найден'))
		}
	})
})

router.get('/entries/:id/getcampaigns', (req, res) => {
	const { id } = req.params;
	const { skip, limit } = req.query

	Campaign.find({'owner': id}, {}, {
		skip: +skip, 
		limit: +limit, 
		sort:{ updated: -1 }
	})
	.exec((err, campaign) => {
		if(!err && campaign) {
			return res.status(200)
			.json(campaign)
		} else {
			return res.status(404)
			.json(error(err, 'Кампании не найдены'))
		}
	})
})

module.exports = router;