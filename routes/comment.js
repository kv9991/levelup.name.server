import express from 'express'
import getValidate from '../validation/comment.js'
import jwt from 'jsonwebtoken'
import config from '../config'
import Post from '../models/post'
import Comment from '../models/comment'
import User from '../models/user'
import { success, error } from '../utils/response.js'

let router = express.Router()

// Get Comments
router.get('/entries', (req, res) => {
  const { skip, limit } = req.query
	Comment.find({}, {}, {
		skip: +skip || 0, 
		limit: +limit || 10, 
		sort: { 
			updated: -1
		}
	}, (err, comments) => {
		if(!err && comments.length > 0) {
			return res.status(200)
			.json(comments)
		} else {
			return res.status(500)
			.json(error(err, 'Ошибка при поиске комментариев'))
		}
	})
});   

// Create Comment
router.post('/entries/', (req, res) => {
	const { content, author, post } = req.body;
	const comment = { content, author, post };
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if (!err && decoded.userID) {
			Comment.create(comment, (err, createdComment) => {
		  	if (!err) {
			  	Post.update({'_id' : post}, {$push: { 'comments': createdComment._id }}, {safe: true, upsert: true})
			  	.exec((err, post) => {
			  		Comment.populate(createdComment, {path: 'author', model: 'User', select: 'slug image fullName'}, (err, comment) => {
					    console.log(comment)
					    res.status(200)
			    		.json(success('Комментарий успешно добавлен', {
			    			comment
			    		}))
					  });
			  	})
			  } else {
			  	return res.status(500)
			  	.json(error(err, 'Ошибка при создании комментария'))
			  }
	  	})	
		} else {
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	})
});

router.delete('/entries/:id', (req, res) => {
	const token = req.headers['authorization'] || false;
	const { id } = req.params

	jwt.verify(token, config.secret, (err, decoded) => {
		if(err && !decoded.userID) { 
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		} else {
			Comment.findOne({'_id' : id}, (err, comment) => {
				if(!err && comment) {
					if (decoded.userID.toString() == comment.author.toString()) {
						Comment.remove({'_id' : id}, (err, mongodb) => {
							return res.status(200)
							.json(success('Комментарий удалён', {
								mongodb
							}))
						})
					} else {
						return res.status(401)
						.json(error(err, 'Недостаточно прав для удаления'))
					}
				} else {
					return res.status(404)
					.json(error(err, 'Комментарий не найден'))
				}
			})
		}
	})
})

router.put('/entries/:id', (req, res) => {
	const token = req.headers['authorization'] || false;
	const newComment = req.body;
	const { id } = req.params;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(err && !decoded.userID) { 
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		} else {
			Comment.findOne({'_id' : id}, (err, comment) => {
				if (decoded.userID == comment.author) {
					Comment.update({'_id' : id}, {$set: newComment}, {safe: true, upsert: false}, (err, updatedComment) => {
						return res.status(200)
						.json(success('Комментарий обновлён', {
							comment: updatedComment
						}))
					})
				} else {
					return res.status(401)
					.json(error(err, 'Недостаточно прав'))
				}
			})
		}
	})
})



module.exports = router