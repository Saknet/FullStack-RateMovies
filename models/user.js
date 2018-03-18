const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  birthDay: Date,
  admin: Boolean,
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
})

userSchema.statics.format = (user) => {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    birthday: user.birthday,
    admin: user.admin,
    ratings: user.ratings,
    reviews: user.reviews
  }
}

const User = mongoose.model('User', userSchema)

module.exports = User