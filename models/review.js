const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
  value: Number,
  reviewTitle: String,
  reviewText: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

reviewSchema.statics.format = (review) => {
  return {
    id: review.id,
    movie: review.movie,
    value: review.value,
    reviewTitle: review.reviewTitle,
    reviewText: review.reviewText,
    user: review.user
  }
}

const Review = mongoose.model('Review', reviewSchema)

module.exports = Review