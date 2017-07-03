var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Comment = require('../models/comment')
var User = require('../models/user')
var Post = require('../models/post')
var Blog = require('../models/blog')
var jwt = require('jsonwebtoken')
var config = require('../config'); 
var validation = require('../validation/user')

// for uploading images
var formidable = require('formidable')
var util = require('util')
var path = require('path')
var fs = require('fs')
var randomString = require('../utils/randomString.js')
var getExtension = require('../utils/getExtension.js')

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

// Заменить на entries/add
router.post('/add', function (req, res) {
	var inputs = req.body;
	var validate = validation.add(inputs);	
	if(validate.success) {
		User.create(inputs, function (err, user) {
		  if (err) return console.log(err);
		  res.json({ 
		    	success: true,
		    	message: 'Пользователь успешно добавлен',
		    	data: user
		    });
		})
	} else {
		res.json({ 
	    	success: false,
	    	errors: validate.errors
	    });
	}
});

// Проверяет токен
router.get('/auth', function(req, res) {
	var token = req.headers['authorization'] || false;
	decoded = jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) {
		    User.findOne({_id : decoded.userID}, function(err, user) {
		    	res.json(user);
		    })
		} else {
			res.json(false);
		}
	})
})

// Выдает токен при авторизации
router.post('/auth', function(req, res) {
  User.findOne({
    slug: req.body.slug
  }, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.json({ success: false, message: 'Пользователь не найден' });
    } else if (user) {
      if (user.userPassword != req.body.userPassword) {
        res.json({ success: false, message: 'Пароль неверный' });
      } else {
        var token = jwt.sign({ userID: user._id }, config.secret, {
          expiresIn : 60*60*24*3
        });
        User.findOne({slug: user.slug}, function(err, user) {
        	if (!err) {
        		res.json({
			        success: true,
			        user: {
			        	token: token
			        }
		        });
        	} else {
        		res.json({
        			success: false,
        			errors: err
        		})
        	}
        })  
      }   
    }
  });
});

// Выдает пользователя по никнейму
router.get('/entries/:nickname', function(req, res) {
	User.findOne({'slug': req.params.nickname}, '-userPassword -__v', function(err, user) {
		if(!err) {
			res.json(user)
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
router.post('/entries/:id/updatefield', function (req, res) {
	data = req.body;
	User.update({'_id' : req.params.id}, {[data.field] : data.value}, function(err) {
		if(!err) return res.json({ success: true })
		res.json(err)
	})
});


// Подписка на авторе. По токену определяется подписант
router.get('/entries/:id/subscribe', function(req, res) {
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret);
	if(token) {
		User.findOne({ '_id': decoded.userID }, function(err, user) {
			if(user.userSubscriptions.users.indexOf(req.params.id) == -1) {
				User.update({ '_id': decoded.userID }, {$push : {'userSubscriptions.users' : req.params.id}}, { safe: true, upsert: true })
				.exec(function(err) {
					if(!err) {
						User.findByIdAndUpdate(req.params.id, {$inc: { 'userSubscribersCount': 1 }}, {upsert: true}, function(err, user) {
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
				User.update({ '_id': decoded.userID }, {$pull : {'userSubscriptions.users' : req.params.id}})
				.exec(function(err, pages) {
					if(!err) {
				  		User.findByIdAndUpdate(req.params.id, {$inc: { 'userSubscribersCount': -1 }}, {upsert: true}, function(err, user) {
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

// Устарел (у router.post уже есть данный метод)
// Возвращает посты пользователя
router.get('/:id/posts', function(req, res) {
	Post.find({'postAuthor': req.params.id}, {}, {
	    skip:0, 
	    limit:10, 
	    sort:{ updated: -1 }
	},
	function(err, posts) {
		res.json(posts);
	});
})

// Возвращает подписки пользователя (объекты пользователей)
router.get('/entries/:id/getsubscriptions', function(req, res) {
	User.findById(req.params.id, function(err, user) {
		User.find({'_id' : { $in : user.userSubscriptions.users }}, function(err, users) {
			res.send(users)
		})
	})
})

// Добавляет соц сеть
router.post('/entries/:id/addsocial', function(req, res) {
	var inputs = req.body;
	var token = req.headers['authorization'] || false;
	jwt.verify(token, config.secret, function(err, decoded) {
		// добавить проверку на токен
		User.findOne({'_id': req.params.id}, function(err, user) {
			var index = -1;
			for(var i = 0, len = user.userSocials.length; i < len; i++) {
			    if (user.userSocials[i].title === inputs.title) {
			        index = i;
			        break;
			    }
			}
			if(index == -1) {
				if(decoded.userID == req.params.id) {
					User.findOneAndUpdate({'_id' : req.params.id}, {$push: {'userSocials' : { 'title': inputs.title, 'link': inputs.link} }}, {upsert:true, safe: true})
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
				for(var i = 0, len = user.userSocials.length; i < len; i++) {
				    if (user.userSocials[i].title == social.title) {
				        index = i;
				        break;
				    }
				}
				User.update({'_id' : req.params.id}, {$pull : {'userSocials': {'title' : social.title}}}, {upsert: true, safe: true}, function(err, response) {
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
				item.postLikes.map((item) => {
					likes++;
				})
			})
			Comment.find({'commentAuthor': req.params.id}, function(err, comments) {
				res.json({
					likes: likes,
					posts: posts.length,
					score: user.userScore,
					comments: comments.length,
					subscribers: user.userSubscribersCount
				})
			})
		})
	})
})

// Возвращает блог пользователя
router.get('/entries/:id/getblog', function(req, res) {
	Blog.findOne({'blogOwner' : req.params.id}, function(err, blog) {
		if(!err) {
			res.json(blog)
		}
	})
})

// Возвращает маски пользователя
router.get('/entries/:id/getfaces', function(req, res) {
	var result = [];
	Blog.findOne({'blogOwner' : req.params.id}, function(err, blog) {
		result.push(blog);
		Blog.find({'blogStaff' : {$in: [req.params.id]}}, function(err, blogs) {
			result.concat(blogs);
			res.json(result);
		})
	})
})

module.exports = router;