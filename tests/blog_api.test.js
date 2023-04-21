const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const jwt = require('jsonwebtoken')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there is initially some blogs saved', () => {
	beforeEach(async () => {
		await Blog.deleteMany({})

		const users = await helper.usersInDb()
		const user = await User.findById(users[0].id)

		for (const blog of helper.initialBlogs) {
			blog.user = user._id
			const blogObject = new Blog(blog)
			await blogObject.save()
			user.blogs = user.blogs.concat(blogObject._id)
			await user.save()
		}
	}, 100000)

	test('all blogs are returned as json', async () => {
		const blogsAtStart = await helper.blogsInDb()

		const blogs = await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/)

		expect(blogs.body).toHaveLength(blogsAtStart.length)
	})

	test('the name of unique identifier of blogs is id', async () => {
		const blogs = await api.get('/api/blogs')

		blogs.body.forEach(blogObject => {
			expect(blogObject.id).toBeDefined()
		})
	})

	test('a new blog can be added by a logged in user', async () => {
		const blogsAtStart = await helper.blogsInDb()

		const newBlog = {
			title: 'How To Write Unit Tests In NodeJS With JEST Test Library',
			author: 'Bhargav Bachina',
			url: 'https://medium.com/bb-tutorials-and-thoughts/how-to-write-unit-tests-in-nodejs-with-jest-test-library-a201658829c7',
			likes: 128,
		}

		const loginResponse = await api
			.post('/api/login')
			.send({ username: 'root', password: '123' })
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const token = loginResponse.body.token

		await api
			.post('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(blogsAtStart.length + 1)

		const titles = blogsAtEnd.map(b => b.title)
		expect(titles).toContain(newBlog.title)
	})

	test('a new blog can not be added by a user with missing or invalid token', async () => {
		const blogsAtStart = await helper.blogsInDb()

		const newBlog = {
			title: 'How To Write Unit Tests In NodeJS With JEST Test Library',
			author: 'Bhargav Bachina',
			url: 'https://medium.com/bb-tutorials-and-thoughts/how-to-write-unit-tests-in-nodejs-with-jest-test-library-a201658829c7',
			likes: 128,
		}

		const token = jwt.sign({ username: 'root' }, process.env.SECRET)

		const result = await api
			.post('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(401)
			.expect('Content-Type', /application\/json/)

		expect(result.body.error).toContain('token missing or invalid')

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
	})

	test('a blog without likes is added by a logged in user with zero likes', async () => {
		const blogsAtStart = await helper.blogsInDb()

		const newBlog = {
			title: 'Blog with zero likes by default',
			author: 'Bhargav Bachina',
			url: 'https://medium.com/bb-tutorials-and-thoughts/how-to-write-unit-tests-in-nodejs-with-jest-test-library-a201658829c7',
		}

		const loginResponse = await api
			.post('/api/login')
			.send({ username: 'root', password: '123' })
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const token = loginResponse.body.token

		await api
			.post('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(blogsAtStart.length + 1)

		const likes = blogsAtEnd.map(b => b.likes)
		expect(likes[likes.length - 1]).toBe(0)
	})

	test('blog without title or url is not added by a logged in user', async () => {
		const blogsAtStart = await helper.blogsInDb()

		const newBlog = {
			author: 'Bhargav Bachina',
		}

		const loginResponse = await api
			.post('/api/login')
			.send({ username: 'root', password: '123' })
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const token = loginResponse.body.token

		await api
			.post('/api/blogs')
			.set('Authorization', `bearer ${token}`)
			.send(newBlog)
			.expect(400)

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
	})

	test('succeeds deletion of a blog with valid id by a logged in valid user', async () => {
		const blogsAtStart = await helper.blogsInDb()

		const loginResponse = await api
			.post('/api/login')
			.send({ username: 'root', password: '123' })
			.expect(200)
			.expect('Content-Type', /application\/json/)

		const token = loginResponse.body.token

		const blogToDelete = blogsAtStart[0]
		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.set('Authorization', `bearer ${token}`)
			.expect(204)

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

		const titles = blogsAtEnd.map(b => b.title)
		expect(titles).not.toContain(blogToDelete.title)
	})

	test('succeeds modification of an existing blog with valid id', async () => {
		const blogsAtStart = await helper.blogsInDb()

		const blogExistingId = blogsAtStart[0].id
		console.log(blogExistingId)

		const blogPropertiesToUpdate = {
			likes: 256,
		}

		const updatedBlog = await api
			.put(`/api/blogs/${blogExistingId}`)
			.send(blogPropertiesToUpdate)
			.expect(200)
			.expect('Content-type', /application\/json/)

		const blogsAtEnd = await helper.blogsInDb()
		expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
		expect(updatedBlog.body.likes).toBe(256)
	})
})

afterAll(() => {
	mongoose.connection.close()
})
