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
}, 100000)

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

test('the name of unique identifier of blogs is id', async () => {
	const blogs = await api.get('/api/blogs')

	blogs.body.forEach(blogObject => {
		expect(blogObject.id).toBeDefined()
	})
})

test('a new blog can be added', async () => {
	const newBlog = {
		title: 'How To Write Unit Tests In NodeJS With JEST Test Library',
		author: 'Bhargav Bachina',
		url: 'https://medium.com/bb-tutorials-and-thoughts/how-to-write-unit-tests-in-nodejs-with-jest-test-library-a201658829c7',
		likes: 232,
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-type', /application\/json/)

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

	const titles = blogsAtEnd.map(b => b.title)
	expect(titles).toContain(newBlog.title)
})

test('a blog without likes is added with zero likes', async () => {
	const newBlog = {
		title: 'How To Write Unit Tests In NodeJS With JEST Test Library',
		author: 'Bhargav Bachina',
		url: 'https://medium.com/bb-tutorials-and-thoughts/how-to-write-unit-tests-in-nodejs-with-jest-test-library-a201658829c7',
	}

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-type', /application\/json/)

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

	const likes = blogsAtEnd.map(b => b.likes)
	expect(likes[likes.length - 1]).toBe(0)
})

test('blog without title or url is not added', async () => {
	const newBlog = {
		author: 'Bhargav Bachina',
	}

	await api.post('/api/blogs').send(newBlog).expect(400)

	const blogsAtEnd = await helper.blogsInDb()
	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('succeeds deletion of a blog with valid id', async () => {
	const blogsAtStart = await helper.blogsInDb()

	const blogToDelete = blogsAtStart[0]

	await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

	const blogsAtEnd = await helper.blogsInDb()

	expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

	const titles = blogsAtEnd.map(b => b.title)

	expect(titles).not.toContain(blogToDelete.title)
})

afterAll(() => {
	mongoose.connection.close()
})
