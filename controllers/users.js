const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
	const users = await User.find({})

	response.json(users)
})

usersRouter.post('/', async (request, response) => {
	const body = request.body

	if (body.password === undefined || body.password.length < 3) {
		return response.status(400).json({
			error:
				'password missing or does not meet minimum length requirements (3)',
		})
	}

	const saltRounds = 10
	const passwordHash = await bcrypt.hash(body.password, saltRounds)

	const user = new User({
		username: body.username,
		name: body.name,
		passwordHash,
	})

	const savedUser = await user.save()

	response.json(savedUser)
})

module.exports = usersRouter
