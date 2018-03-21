const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
  name: String,
  birthday: Date,
  bornIn: String,
  dateOfDeath: Date,
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

personSchema.statics.format = (person) => {
  return {
    id: person.id,
    name: person.name,
    birthddy: person.birthday,
    dateOfDeath: person.dateOfDeath,
    movies: person.movies,
    user: person.user
  }
}

const Person = mongoose.model('Person', personSchema)

module.exports = Person