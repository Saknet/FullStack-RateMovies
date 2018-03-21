const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
  
usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    const existingUser = await User.find({username: body.username})
    if (existingUser.length > 0) {
      return response.status(400).json({ error: 'username must be unique' })
    }

    if (body.password.length < 3) {
        return response.status(400).json({ error: 'password must at least 3 characters long' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
      birthday: body.birthday
    })

    if (body.admin === undefined) {
        user.admin = false;
    }

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})
  
usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('ratings', { target: 1, value: 1 })
    .populate('reviews', { target: 1, rating: 1 , reviewText: 1 })
    .populate('movies', { title: 1, directors: 1, writers: 1, actors: 1, releaseYear: 1, title: 1, plotSummary: 1, runTime: 1, country: 1, ratings: 1, reviews: 1 })
    .populate('persons', { target: 1, rating: 1 , reviewText: 1 })

  response.json(users.map(User.format))
})

usersRouter.get('/:id', async (request, response) => {
  try {
    const user = await User.findById(request.params.id)
      .populate('ratings', { target: 1, value: 1  })
      .populate('reviews', { target: 1, rating: 1 , reviewText: 1 })
      .populate('movies', { title: 1, directors: 1, writers: 1, actors: 1, releaseYear: 1, title: 1, plotSummary: 1, runTime: 1, country: 1, ratings: 1, reviews: 1 })
      .populate('persons', { target: 1, rating: 1 , reviewText: 1 })

    if (user) {
      response.json(User.format)
    } else {
      response.status(404).end()
    }

  } catch (exception) {
    console.log(exception)
    response.status(400).send({ error: 'malformatted id' })
  }
})

module.exports = usersRouter