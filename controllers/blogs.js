const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleWare = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
	response.json(blogs)
})

blogsRouter.post('/', middleWare.userExtractor, async (request, response) => {
	const body = request.body
	const user = request.user

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0,
		user: user._id,
	})

	const savedBlog = await blog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()

	response.status(201).json(savedBlog)
})

blogsRouter.delete(
	'/:id',
	middleWare.userExtractor,
	async (request, response) => {
		const user = request.user
		const blog = await Blog.findById(request.params.id)

		if (blog.user.toString() !== user._id.toString()) {
			return response
				.status(403)
				.json({ error: 'unauthorized user for this operation' })
		}

		await Blog.findByIdAndRemove(blog._id)
		user.blogs = user.blogs.filter(
			blogObject => blogObject.toString() !== blog._id.toString()
		)
		await user.save()

		response.status(204).end()
	}
)

blogsRouter.put('/:id', async (request, response) => {
	const blog = {
		title: request.body.title,
		author: request.body.author,
		url: request.body.url,
		likes: request.body.likes,
	}

	const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
		new: true,
	})

	response.status(200).json(updatedBlog)
})

module.exports = blogsRouter
