import express from 'express'
import jwt from 'jsonwebtoken'
import config from '../config'
import createSlug from '../utils/createSlug.js'
import { success, error } from '../utils/response.js'

// Models
import Blog from '../models/blog'
import User from '../models/user'
import Post from '../models/post'

// App Instances
let router = express.Router()

// Get Entries
// TODO: add query field, value
router.get('/entries', (req, res) => {
	const { skip, limit } = req.query
	Blog.find({}, {}, {
		skip: +skip || 0, 
		limit: +limit || 10, 
		sort: { 
			updated: -1
		}
	}, (err, blogs) => {
		if(!err && blogs.length > 0) {
			return res.status(200)
			.json(blogs)
		} else {
			return res.status(500)
			.json(error(err, 'Ошибка при поиске блогов'))
		}
	})
});    

// Get Entry
router.get('/entries/:slug/', (req, res) => {
	const { slug } = req.params
	Blog.findOne({ slug })
	.populate({
		path: 'posts',
		options: {
			limit: 10
		}
	})
	.populate({
		path: 'owner',
		model: 'User',
		select: 'image fullName slug description'
	})
	.exec((err, blog) => {
		if(!err && blog) {
			Blog.populate(blog, [{
				path: 'posts.comments',
				model: 'Comment'
			}, {
				path: 'posts.author.blog',
				model: 'Blog',
				select: 'image title description slug owner'
			}], (err, blog) => {
				Blog.populate(blog, {
					path: 'posts.comments.author',
					model: 'User',
					select: 'image slug fullName description'
				}, (err, blog) => {
					return res.status(200)
					.json(blog)
				})
			})
		} else {
			return res.status(404)
			.send('Блог не найден')
		}
	})
});  

// Get Entry
router.get('/entries/id/:id', (req, res) => {
	const { id } = req.params
	Blog.findOne({'_id': id })
	.populate({
		path: 'posts',
		options: {
			limit: 10
		}
	}).exec((err, blog) => {
		if(!err && blog) { 
			return res.status(200)
			.json(blog)
		} else {
			return res.status(404)
			.send('Блог не найден')
		}
	})
});  

// Create Blog
router.post('/entries/', (req, res) => {
	const token = req.headers['authorization'] || false;
	const { title, owner } = req.body;
	jwt.verify(token, config.secret, (err, decoded) => {

		if(!err && decoded.userID) {

			const newBlog = {
				slug: createSlug(title),
				title: title,
				owner: decoded.userID
			}
			Blog.findOne({
				'owner' : decoded.userID
			}, (err, blog) => {
				if(!blog) {
					Blog.create(newBlog, (err, createdBlog) => {
						console.log(err, createdBlog)
					  if(!err && createdBlog) {
					  	return res.status(200)
					  	.json(success('Блог успешно создан', {
					  		blog
					  	}))
					  }
					})
				} else {
					return res.status(500)
					.json(error([], 'Блог уже создан'))
				}
			})
		} else {
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	});
});

router.put('/entries/:id/field', (req, res) => {
	const { id } = req.params
	const { value, field } = req.body;
	Blog.update({'_id' : id}, {[field] : value}, (err, blog) => {
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

// Удаление по id
router.delete('/entries/:id', (req, res) => {
	const token = req.headers['authorization'] || false;

	jwt.verify(token, config.secret, (err, decoded) => {
		if(!err && decoded.userID) {
			Blog.remove({'_id' : req.params.id}, (err) => {
				if(!err) {
					return res.status(200)
					.json(success('Удаление прошло успешно'))
				} else {
					return res.status(500)
					.json(error(err, 'Ошибка при удалении'))
				}
			})
		} else {
			return res.status(401)
			.json(error(err, 'Неверный токен'))
		}
	})
});

router.get('/entries/:id/getstats', (req, res) => {
	const { id } = req.params

	Post.find({'author.blog' : id}, (err, posts) => {
		if(!err && posts.length > 0) {
			User.findById(id, (err, user) => {
				if(!err) {
					const stats = {
						posts: posts.length,
						comments: getCount(posts, 'comments'),
						likes: getCount(posts, 'likes')
					}
					return res.status(200)
					.json(stats)
				} else {
					return res.status(404)
					.json(error(err, 'Пользователь не найден'))
				}
			}) 
		} else {
			return res.status(200)
			.json({
				likes: 0,
				posts: 0,
				comments: 0
			})
		}
	})
})

function getCount(array, field) {
	let result = 0;
	array.map((item) => {
		item[field].map(() => {
			result++;
		})
	})
	return result
}

module.exports = router