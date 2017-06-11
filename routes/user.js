var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var User = require('../models/user')
var Post = require('../models/post')
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
  User.find({}, function(err, users) {
    res.json(users);
  });
});   

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

router.get('/auth', function(req, res) {
	var token = req.headers['authorization'] || false;
	decoded = jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) {
		    User.findOne({_id : decoded.userID}, function(err, user) {
		    	console.log(user)
		    	res.json(user);
		    })
		} else {
			res.json(false);
		}
	})
})

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
          expiresIn : 60*60*24
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

router.get('/entries/:nickname', function(req, res) {
	var query = User.where({slug: req.params.nickname});
	query.findOne(function(err, user) {
		if(!err) {
			res.json(user)
		}
	});
})

router.get('/entries/id/:id', function(req, res) {
	User.findOne({ '_id': req.params.id }, '-userPassword -__v', function(err, user) {
		if(!err) {
			res.json(user)
		}
	})
})

router.get('/entries/:id/field/:field', function(req, res) {
	User.findOne({ '_id': req.params.id }, req.params.field, function(err, field) {
		if(!err) {
			res.json(field)
		}
	});
})


router.get('/entries/:id/remove', function(req, res) {
	User.findOne({_id: req.params.id}).remove(function(err) {
		if(!err) {
			res.json({
				success: true,
				message: `Документ успешно удалён`
			})
		} else {
			res.json({
				success:false,
				message: err
			})
		}
	})
})


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


// Убрать Author отсюда
router.get('/:id/subscribe/author', function(req, res) {
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret);
	if(token) {
		User.findOne({ '_id': decoded.userID }, function(err, user) {
			if(user.userSubscriptions.authors.indexOf(req.params.id) == -1) {
				User.update({ '_id': decoded.userID }, {$push : {'userSubscriptions.authors' : req.params.id}}, { safe: true, upsert: true })
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
				User.update({ '_id': decoded.userID }, {$pull : {'userSubscriptions.authors' : req.params.id}})
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



router.post('/upload', function (req, res) {
	var filename, dir, userID;

	// Инициализируем парсер
	var form = new formidable.IncomingForm();
	form.parse(req)
	form.multiples = false;
	form.uploadDir = path.join(process.cwd(), '/uploads/users/')
	form.keepExtensions = true;

	form.on('field', function(field, value) {
		if(field == 'userID') {
			userID = value
		}
	})

	// Парсим файл и переименовываем его
	form.on('file', function(field, file) {
		console.log(userID)
		filename = randomString(16) + getExtension(file.type);
		dir = form.uploadDir + userID;
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


router.get('/entries/:id/getsubscriptions', function(req, res) {
	User.findById(req.params.id, function(err, user) {
		User.find({'_id' : { $in : user.userSubscriptions.authors }}, function(err, users) {
			res.send(users)
		})
	})
})

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

/* router.get('/entries/:id/removesocial', function(req, res) {
	var inputs = req.body;
	User.findOneAndUpdate({'_id' : req.params.id}, {$set : {'userSocials' : []}}, {upsert:true})
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
}) */


router.get('/entries/:id/getlikecount', function(req, res) {
	Post.find({'postAuthor' : req.params.id}, function(err, posts) {
		if(!err) {
			var likes = 0;
			posts.map((item) => {
				item.postLikes.map((item) => {
					likes++;
				})
			})

			res.json({count: likes})
		}
	})
})

router.get('/entries/:id/getpostscount', function(req, res) {
	Post.find({'postAuthor' : req.params.id}, function(err, posts) {
		if(!err) {
			res.json({count: posts.length})
		}
	})
})


// Добавить каждой соц сети уникальный id (передавать через POST)
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



module.exports = router;