const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  value: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

ratingSchema.statics.format = (rating) => {
  return {
    id: rating.id,
    movie: rating.movie,
    value: rating.value,
    user: rating.user
  }
}

const Rating = mongoose.model('Rating', ratingSchema)

module.exports = Rating