const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
  title: String,
  directors: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  writers: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  actors: { type: mongoose.Schema.Types.ObjectId, ref: 'Person' },
  releaseYear: Number,
  plotSummary: String,
  runTime: Number,
  country: String,
  ratings: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },
  reviews: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

movieSchema.statics.format = (movie) => {
  return {
    id: movie._id,
    title: movie.title,
    directors: movie.directors,
    writers: movie.writers,
    actors: movie.actors,
    releaseYear: movie.releaseYear,
    plotSummary: movie.plotSummary,
    runTime: movie.runTime,
    country: movie.country,
    ratings: movie.ratings,
    reviews: movie.reviews,
    user: movie.user
  }
}

const Movie = mongoose.model('Movie', movieSchema)

module.exports = Movie