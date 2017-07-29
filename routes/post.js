import express from 'express'
import Post from '../models/post'
import Tag from '../models/tag'
import User from '../models/user'
import Campaign from '../models/campaign'
import jwt from 'jsonwebtoken'
import config from '../config'
import createSlug from '../utils/createSlug.js'
import validation from '../validation/post'
import mongoose from 'mongoose'
import { success, error } from '../utils/response.js'

let router = express.Router()

// Get Entries
router.get('/entries', (req, res) => {
	var { limit, skip, userID, type, status, blogID } = req.query
	const token = req.headers['authorization'] || false;

	var query = {};
	if(userID) { 
		query['author.user'] = userID
	}
	if(type) { 
		query['type'] = { 
			$in : type
		}
	}
	if(status) {
		query['status'] = {
			$in : status
		}
	}
	if(blogID) {
		query['author.blog'] = blogID
	}

	Post.find(query, {}, {
		skip: +skip, 
		limit: +limit || 10, 
		sort: { updated: -1 }
	})
	.populate([{
		path: 'author.user',
		model: 'User'
	}, {
		path: 'author.blog',
		model: 'Blog'
	}, {
  	path: 'comments',
  	options: {
		  sort: { updated: 1 }
	  }
	}])
	.exec((err, results) => {
    var options = {
      path: 'comments.author',
      model: 'User',
      select: 'image fullName slug description'
    };

    if (err) return res.json(500);
    Post.populate(results, options, (err, posts) => {
      res.json(posts);
    });
	})
});   

// Get Personal Feed
router.get('/entries/personal', function(req, res) {
	var query = { skip: req.query.skip || 0, limit: req.query.limit || 10 }
	var token = req.headers['authorization'] || false;
	var decoded = jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) {
			User.findOne({'_id' : decoded.userID}, function(err, user) {
				var array = user.userSubscriptions.users.concat(user.userSubscriptions.blogs)
				var query = {'postAuthor.authorID' : {$in : array}, 'postStatus': 'published'};
				Post.find(query, null, {
					skip: +req.query.skip, 
					limit: +req.query.limit, 
					sort: { updated: -1 }
				}, function(err, posts) {
					return res.json(posts)
				})
			})
		} else {
			Post.find({'type': 'post', 'status': 'published'}, null, {
			   skip: +query.skip, 
			   limit: +query.limit, 
			   sort:{ updated: -1 }
			},
			function(err, entries) {
				res.json(entries);
			});
		}
	})
});  

router.get('/popular', function(req, res) {
	var query = { 
		skip: req.query.skip || 0, 
		limit: req.query.limit || 10 
	}
  	Post.find({'type': 'post'}, {}, {
	    skip: + query.skip, 
	    limit: + query.limit, 
	    sort:{ updated: -1 }
	},
	(err, entries) => {
		res.json(entries);
	});
});   

// Create
router.post('/entries', (req, res) => {
	const token = req.headers['authorization'] || false;
	const { title, content, author, video, image, link, tags, status, type, slug } = req.body;
	const post = { title, content, author, video, image, link, tags, status, type, slug }
	const validate = validation.add(post);

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded) {
			Post.create(post, (err, createdPost) => {
				if(!err && createdPost) {
					//response
					var populationQuery = [
						{ path: 'author.blog' }, 
						{ path: 'author.user' }
					]
				  
				  Post.populate(createdPost, populationQuery, (err, user) => {
				    res.status(200)
		    		.json(success('Пост успешно опубликован', {
		    			post: createdPost
		    		}))
				  });
	    		// create tags
					tags.forEach((title, i) => {
						Tag.findOne({title}, (err, tag) => {
							if(err && !tag) { Tag.create({
								slug: createSlug(item),
								title
							})} 
						})
					})
				} else {
					// handle errors
					res.status(200)
	    		.json(error(err, 'Произошла ошибка при публикации'))
				}
			})
		}
	})
});


router.get('/entries/:slug', function(req, res) {
	Post.findOne({'slug': req.params.slug})
	.populate('likes comments')
	.populate('author.blog')
	.populate('author.user')
	.exec(function(err, results) {
	    var options = {
	      path: 'comments.author',
	      model: 'User',
	      select: 'image fullName slug description'
	    };

	    if (err) return res.json(500);
	    Post.populate(results, options, function (err, posts) {
	      res.json(posts);
	    });
	})
})

router.get('/entries/:id/byid', function(req, res) {
	Post.findOne({'_id': req.params.id})
	.populate('likes')
	.exec(function(err, post) {
		if(!err) {
	    	res.json(post);
		} else {
			return(false)
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

router.post('/entries/:id/update', function(req, res) {
	var inputs = req.body;
	Post.findOneAndUpdate({ '_id': req.params.id }, { $set: inputs }, function(err, post) {
		if(!err) {
			if(inputs.postTags){
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
			}
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
	jwt.verify(token, config.secret, function(err, decoded) {
		if(!err) {
			Post.findOne({ '_id': postID }, function(err, post) {
				if(post.likes.indexOf(decoded.userID) == -1) {
					Post.update({ '_id': postID }, { $push: { 'likes': decoded.userID }}, {safe: true, upsert: true})
					.exec(function(err) {
						if(!err) {
					  		return res.json({
					  			success: true,
					  			message: 'Лайк поставлен',
					  			counter: post.likes.length + 1
					  		});
					  	} else {
					  		return res.json({
					  			success: false,
					  			errors: err
					  		})
					  	}
					})
				} else {
					Post.update({ '_id': postID }, { $pull: { 'likes': decoded.userID }})
					.exec(function(err) {
						if(!err) {
					  		return res.json({
					  			success: true,
					  			message: 'Лайк удалён',
					  			counter: post.likes.length - 1
					  		});
					  	} else {
					  		return res.json({
					  			success: false,
					  			errors: err
					  		})
					  	}
					})
				}
			});
		} else {
			return res.json({
				success: false,
				message: 'Неверный токен'
			})
		}
	});
})

router.get('/entries/:id/wholikes', function(req, res) {
	Post.findOne({'_id' : req.params.id}, function(err, post) {
		User.find({'_id' : { $in : post.likes }} , function(err, users) {
			res.json(users)
		})
	})
})

// Обновление одного поля (Работает совместно с глобальным методом updateField())
router.put('/entries/:id/field', (req, res) => {
	const { id } = req.params
	const { value, field } = req.body;
	Post.update({'_id' : id}, {[field] : value}, (err, blog) => {
		if(!err && blog) {
			return res.status(200)
			.json(success('Поле успешно обновлено', {
				blog
			}))
		} else {
			return res.status(500)
			.json(error(err, 'Ошибка при обновлении поля'))
		} 
	})
});

router.get('/entries/:id/adv', (req, res) => {
	const { id } = req.params;

	Post.findOne({'_id': id}, (err, post) => {
		Campaign.find({'placements.users' : {$in : [post.author.user]}})
		.populate('advertisements')
		.exec((err, campaigns) => {
			let randomCampaign = Math.floor(Math.random() * campaigns.length)
			let randomAdv = Math.floor(Math.random() * campaigns[randomCampaign].advertisements.length);
			if(!err && campaigns) {
				return res.status(200)
				.json(campaigns[randomCampaign].advertisements[randomAdv])
			} else {
				return res.status(500)
				.json(error(err, 'Кампания не найдена'))
			} 
		})
	}) 
});


module.exports = router;