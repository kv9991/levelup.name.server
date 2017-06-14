var express = require('express')
var router = express.Router()
var Post = require('../models/post')
var Tag  = require('../models/tag')
var jwt = require('jsonwebtoken')
var config = require('../config'); 
var createSlug = require('../utils/createSlug.js')
var validation = require('../validation/post')
var formidable = require('formidable')
var util = require('util')
var path = require('path')
var fs = require('fs')
var randomString = require('../utils/randomString.js')
var getExtension = require('../utils/getExtension.js')
var User = require('../models/user.js')


router.post('/entries', function(req, res) {
	var options = req.body;
	var query = {};

	if(options.userID) { 
		query.postAuthor = options.userID
	}
	if(options.postTypes) {
		query.postType = {$in : options.postTypes}
	}

	Post.find(query, {}, {
		skip: options.skip, 
		limit: options.perPage, 
		sort:{ updated: -1 }
	}, function(err, posts) {
		res.json(posts)
	})
});  

router.get('/entries/personal', function(req, res) {
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret, function(err, decoded) {
		console.log(err)
		if(!err) {
			User.findOne({'_id' : decoded.userID}, function(err, user) {
				console.log(user)
				Post.find({'postAuthor' : {$in : user.userSubscriptions.users}}, {}, {
					skip: req.query.skip, 
					limit: 10, 
					sort:{ updated: -1 }
				}, function(err, posts) {
					return res.json(posts)
				})
			})
		} else {
			Post.find({}, function(err, posts) {
				return res.json(posts)
			})
		}
	})
});  

router.get('/entries', function(req, res) {
  Post.find({}, {}, {
	    skip:0, 
	    limit:10, 
	    sort:{ updated: -1 }
	},
	function(err, entries) {
		res.json(entries);
	});
});   

router.post('/add', function (req, res) {
	var inputs = req.body;
	var validate = validation.add(inputs);
	if(validate.success) {
		if(inputs.postType == 'post') {
			Post.create(inputs, function (err, post) {
			  if (err) { return console.log(err) 
			  	} else {
			  	inputs.postTags.forEach(function(item) {
			  		Tag.findOne({'tagTitle' : item}, function(err, tag) {
			  			if(tag == null) { Tag.create({
			  					slug: createSlug(item),
					  			tagTitle: item
					  		})
			  			}
			  		})
			  	})
			  	res.json({ 
			    	success: true,
			    	message: 'Пост успешно опубликован',
			    	post: post
			    });
			  }
			})
		} else {
			Post.create(inputs, function(err, post) {
				res.json({
					success: true,
					message: 'Пост успешно опубликован',
					post: post
				})
			})
		}
	} else {
		res.json({ 
	    	success: false,
	    	errors: validate.errors
	    });
	}
});


router.get('/entries/:slug', function(req, res) {
	var query = Post.where({slug: req.params.slug});
	query.findOne(function(err, entry) {
		if(!err) {
			res.json(entry)
		}
	});
})


router.get('/entries/:id/remove', function(req, res) {
	Post.findOne({_id: req.params.id}).remove(function(err) {
		if(!err) {
			res.json({
				success: true,
				message: `Пост успешно удалён`
			})
		} else {
			res.json({
				success:false,
				message: err
			})
		}
	})
})

router.post('/upload', function (req, res) {
	var filename, dir, id;

	// Инициализируем парсер
	var form = new formidable.IncomingForm();
	form.parse(req)
	form.multiples = false;
	form.uploadDir = path.join(process.cwd(), '/uploads')
	form.keepExtensions = true;

	// Парсим storage-id поста
	form.on('field', function(field, value) {
		if (field == 'storage') {
			id = value
		}
    });
	
	// Парсим файл и переименовываем его
	form.on('file', function(field, file) {
		filename = randomString(16) + getExtension(file.type);
		dir = form.uploadDir + '/posts/' + id + '/';
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

router.post('/entries/:id/update', function(req, res) {
	var inputs = req.body;
	Post.update({ '_id': req.params.id }, { $set: inputs }, function(err, post) {
		if(!err) {
			var tags = inputs.postTags.toString().split(/[ ,]+/);
		  	tags.forEach(function(item) {
		  		Tag.findOne({'tagTitle' : item}, function(err, tag) {
		  			if(tag == null) {
		  				Tag.create({
		  					slug: createSlug(item),
				  			tagTitle: item
				  		})
		  			}
		  		})
		  	})
		  	res.json({
	  			success: true,
	  			post: post
	  		});
	  	} else {
	  		res.json({
	  			success: false,
	  			errors: err
	  		})
	  	}
	})
})


router.get('/entries/:id/like', function(req, res) {
	var postID = req.params.id;
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) {
			Post.findOne({ '_id': postID }, function(err, post) {
				console.log(err)
				if(post.postLikes.indexOf(decoded.userID) == -1) {
					Post.update({ '_id': postID }, { $push: { 'postLikes': decoded.userID }}, {safe: true, upsert: true})
					.exec(function(err) {
						if(!err) {
					  		res.json({
					  			success: true,
					  			message: 'Лайк поставлен',
					  			counter: post.postLikes.length + 1
					  		});
					  	} else {
					  		res.json({
					  			success: false,
					  			errors: err
					  		})
					  	}
					})
				} else {
					Post.update({ '_id': postID }, { $pull: { 'postLikes': decoded.userID }})
					.exec(function(err) {
						if(!err) {
					  		res.json({
					  			success: true,
					  			message: 'Лайк удалён',
					  			counter: post.postLikes.length - 1
					  		});
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
	});
})

router.get('/entries/:id/wholikes', function(req, res) {
	Post.findOne({'_id' : req.params.id}, function(err, post) {
		User.find({'_id' : { $in : post.postLikes }} , function(err, users) {
			res.json(users)
		})
	})
})


module.exports = router;