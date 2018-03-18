const moviesRouter = require('express').Router()
const Movie = require('../models/movie')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const MovieRating = require('../models/rating')
const MovieReview = require('../models/review')


moviesRouter.get('/', async (request, response) => {
  const movies = await Movie 
    .find({})
    .populate('person', { name: 1, birthday: 1, bornIn: 1, dateOfDeath: 1 })
    .populate('rating', { value: 1, user: 1 })
    .populate('review', { value: 1, reviewText: 1, user })
    .populate('user', { username: 1, name: 1, birthDay: 1, admin: 1 })
  
  response.json(movies.map(Movie.format))
})

moviesRouter.get('/:id', async (request, response) => {
    try {
      const movie = await Movie.findById(request.params.id)
      .populate('person', { name: 1, birthday: 1, bornIn: 1, dateOfDeath: 1 })
      .populate('rating', { value: 1, user: 1 })
      .populate('review', { value: 1, reviewText: 1, user })
      .populate('user', { username: 1, name: 1, birthDay: 1, admin: 1 })

      if (movie) {
        response.json(Movie.format(movie))
      } else {
        response.status(404).end()
      }
  
    } catch (exception) {
      console.log(exception)
      response.status(400).send({ error: 'malformatted id' })
    }
  })

moviesRouter.post('/', async (request, response) => {
  const body = request.body

  try {
      const decodedToken = jwt.verify(request.token, process.env.SECRET)

      if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }

      if (body.title === undefined) {
        return response.status(400).json({ error: 'title  missing' })
      }

      if (body.directors === undefined) {
        return response.status(400).json({ error: 'director(s)  missing' })
      }

      if (body.writers === undefined) {
        return response.status(400).json({ error: 'writer(s)  missing' })
      }

      if (body.actors === undefined) {
        return response.status(400).json({ error: 'actor(s)  missing' })
      }

      const user = await User.findById(decodedToken.id)      

      const movie = new Movie({
        title: body.title,
        directors: body.directors,
        writers: body.writers,
        actors: body.actors,
        title: body.title,
        releaseYear: body.releaseYear,
        plotSummary: body.plotSummary,
        runTime: body.runTime,        
        user: user._id,
        ratings: [],
        reviews: []
      })
  
      const savedMovie = await movie.save()
      user.movies = user.movies.concat(savedMovie._id)
      await user.save()

      response.json(Movie.format(movie))
  } catch (exception) {
      if (exception.name === 'JsonWebTokenError' ) {
        response.status(401).json({ error: exception.message })
      } else {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
      }
  }
})  

moviesRouter.delete('/:id', async (request, response) => {
    try {
      const decodedToken = jwt.verify(request.token, process.env.SECRET)

      if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const movie = await Movie.findById(request.params.id)  
    
      if (movie.user === undefined || movie.user.admin === true|| movie.user.toString() === decodedToken.id.toString()) {
        await Movie.findByIdAndRemove(request.params.id)
      } else {
        return response.status(401).json({ error: 'only admins and person who has added the movie can remove it' })     
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

moviesRouter.put('/:id', async (request, response) => {
    try {
        const body = request.body
        const movie = {
            title: body.title,
            directors: body.directors,
            writers: body.writers,
            actors: body.actors,
            title: body.title,
            releaseYear: body.releaseYear,
            plotSummary: body.plotSummary,
            runTime: body.runTime,        
            user: user._id,
            ratings: [],
            reviews: []
        }

        const updatedMovie = await Movie.findByIdAndUpdate(request.params.id, movie, { new: true })
          
        response.json(Movie.format(updatedMovie))
    } catch (exception) {
        console.log(exception)
        response.status(400).send({ error: 'malformatted id' })       
    }
  })

  moviesRouter.post('/:id/ratings/', async (request, response) => {
    const body = request.body
    const movie = await Movie.findById(body.id)      
  
    try {      
        const rating = new Rating({
          value: body.value,
          movie: movie._id,
          user: user._id
        })
    
        const savedRating = await rating.save()
        movie.ratings = movie.ratings.concat(savedRating._id)
        await movie.save()
  
        response.json(Movie.format(movie))
    } catch (exception) {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
        
    }
  })
  
  moviesRouter.put('/:id/ratings/:id', async (request, response) => {
    const body = request.body
    const movie = await Movie.findById(body.id)  

    try {
        const body = request.body
        const rating = {
            value: body.value,
            movie: movie._id,
            user: user._id
        }

        const updatedRating = await Rating.findByIdAndUpdate(request.params.id, rating, { new: true })
          
        movie.ratings = movie.ratings.filter(r => r.id !== request.params.id)
        movie.ratings = movie.ratings.concat(updatedRating._id)
        await movie.save()
  
        response.json(Movie.format(movie))
    } catch (exception) {
        console.log(exception)
        response.status(400).send({ error: 'malformatted id' })       
    }
  })

  moviesRouter.delete('/:id/ratings/:id', async (request, response) => {
    try {
      const decodedToken = jwt.verify(request.token, process.env.SECRET)

      if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const rating = await Rating.findById(request.params.id)  
    
      if (rating.user === undefined || rating.user.admin === true|| rating.user.toString() === decodedToken.id.toString()) {
        await Rating.findByIdAndRemove(request.params.id)
        const body = request.body
        const movie = await Movie.findById(body.id) 
        movie.ratings = movie.ratings.filter(r => r.id !== request.params.id) 
        await movie.save()
  
        response.json(Movie.format(movie))
      } else {
        return response.status(401).json({ error: 'only admins and person who has added the rating can remove it' })     
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
  
moviesRouter.post('/:id/reviews', async (request, response) => {
    const body = request.body
    const movie = await Movie.findById(body.id)      
  
    try {      
        const review = new Review({
          value: body.value,
          reviewTitle: body.reviewTitle,
          reviewText: body.reviewText,
          movie: movie._id,
          user: user._id
        })
    
        const savedReview = await review.save()
        movie.reviews = movie.reviews.concat(savedReview._id)
        await movie.save()
  
        response.json(Movie.format(movie))
    } catch (exception) {
        console.log(exception)
        response.status(500).json({ error: 'something went wrong...' })
        
    }
  })

  moviesRouter.put('/:id/reviews/:id', async (request, response) => {
    const body = request.body
    const movie = await Movie.findById(body.id)  

    try {
        const review = {
            value: body.value,
            reviewTitle: body.reviewTitle,
            reviewText: body.reviewText,
            movie: movie._id,
            user: user._id
        }

        const updatedReview = await Review.findByIdAndUpdate(request.params.id, review, { new: true })
          
        movie.reviews = movie.reviews.filter(r => r.id !== request.params.id)
        movie.reviews = movie.reviews.concat(updatedReview._id)
        await movie.save()
  
        response.json(Movie.format(movie))
    } catch (exception) {
        console.log(exception)
        response.status(400).send({ error: 'malformatted id' })       
    }
  })

  moviesRouter.delete('/:id/reviews/:id', async (request, response) => {
    try {
      const decodedToken = jwt.verify(request.token, process.env.SECRET)

      if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
      }
      const review = await Review.findById(request.params.id)  
    
      if (review.user === undefined || review.user.admin === true|| rating.user.toString() === decodedToken.id.toString()) {
        await Review.findByIdAndRemove(request.params.id)
        const body = request.body
        const movie = await Movie.findById(body.id) 
        movie.reviews = movie.reviews.filter(r => r.id !== request.params.id) 
        await movie.save()
  
        response.json(Movie.format(movie))
      } else {
        return response.status(401).json({ error: 'only admins and person who has added the review can remove it' })     
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

module.exports = moviesRouter