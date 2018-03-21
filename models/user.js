const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  birthDay: Date,
  admin: Boolean,
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  persons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Person' }],
})

userSchema.statics.format = (user) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    birthday: user.birthday,
    admin: user.admin,
    ratings: user.ratings,
    reviews: user.reviews,
    user: user.movies,
    persons: user.persons
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User