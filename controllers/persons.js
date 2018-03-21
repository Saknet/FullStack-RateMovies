const personsRouter = require('express').Router()
const Person = require('../models/person')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

personsRouter.get('/', async (request, response) => {
  const persons = await Person 
    .find({})
    .populate('user', { username: 1, name: 1, birthDay: 1, admin: 1 })
    .populate('movies', { title: 1, directors: 1, writers: 1, actors: 1, releaseYear: 1, title: 1, plotSummary: 1, runTime: 1, country: 1, ratings: 1, reviews: 1 })
  
  response.json(persons.map(Person.format))
})

personsRouter.get('/:id', async (request, response) => {
    try {
      const person = await Person.findById(request.params.id)
      .populate('user', { username: 1, name: 1, birthDay: 1, admin: 1 })
      .populate('movies', { title: 1, directors: 1, writers: 1, actors: 1, releaseYear: 1, title: 1, plotSummary: 1, runTime: 1, country: 1, ratings: 1, reviews: 1 })

      if (person) {
        response.json(Person.format(person))
      } else {
        response.status(404).end()
      }
  
    } catch (exception) {
      console.log(exception)
      response.status(400).send({ error: 'malformatted id' })
    }
  })

personsRouter.post('/', async (request, response) => {
  const body = request.body

  try {
      const decodedToken = jwt.verify(request.token, process.env.SECRET)

      if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }

      if (body.name === undefined) {
        return response.status(400).json({ error: 'name  missing' })
      }

      if (body.birthday === undefined) {
        return response.status(400).json({ error: 'birthday  missing' })
      }

      if (body.bornIn === undefined) {
        return response.status(400).json({ error: 'bornIn  missing' })
      }

      if (body.dateOfDeath === undefined) {
        body.dateOfDeath = null
      }

      const user = await User.findById(decodedToken.id)      

      const person = new Person({
        name: body.name,
        birthday: body.birthday,
        bornIn: body.bornIn,
        dateOfDeath: body.dateOfDeath,        
        user: user._id
      })
  
      const savedPerson = await person.save()
      user.persons = user.persons.concat(savedPerson._id)
      await user.save()

      response.json(Person.format(person))
  } catch (exception) {
      if (exception.name === 'JsonWebTokenError' ) {
        response.status(401).json({ error: exception.message })
      } else {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
      }
  }
})  

personsRouter.delete('/:id', async (request, response) => {
    try {
      const decodedToken = jwt.verify(request.token, process.env.SECRET)

      if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const person = await Person.findById(request.params.id)  
    
      if (person.user === undefined || person.user.admin === true|| movie.user.toString() === decodedToken.id.toString()) {
        await Person.findByIdAndRemove(request.params.id)
      } else {
        return response.status(401).json({ error: 'only admins and person who has added the person can remove it' })     
      }

      response.status(204).end()
    }  catch (exception) {
      if (exception.name === 'JsonWebTokenError' ) {
        response.status(401).json({ error: exception.message })
      } else {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
      }
  }
})

personsRouter.put('/:id', async (request, response) => {
    try {
        const body = request.body
        const person = new Person({
            name: body.name,
            birthday: body.birthday,
            bornIn: body.bornIn,
            dateOfDeath: body.dateOfDeath,        
            user: user._id
        })

        const updatedPerson = await Person.findByIdAndUpdate(request.params.id, person, { new: true })
          
        response.json(Person.format(updatedPerson))
    } catch (exception) {
        console.log(exception)
        response.status(400).send({ error: 'malformatted id' })       
    }
  })