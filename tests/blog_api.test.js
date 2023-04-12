const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
	await Blog.deleteMany({})

	for (const blog of helper.initialBlogs) {
		const blogObject = new Blog(blog)
		await blogObject.save()
	}
}, 10000)

test('blogs are returned as json', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-type', /application\/json/)
})

test('all blogs are returned', async () => {
	const blogs = await api.get('/api/blogs')

	expect(blogs.body).toHaveLength(helper.initialBlogs.length)
})

afterAll(() => {
	mongoose.connection.close()
})
