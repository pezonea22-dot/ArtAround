const mongoose = require('mongoose')

const museumObjectSchema = new mongoose.Schema({
  universalId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  artist: String,
  year: String,
  room: String,
  position: {
    x: Number,
    y: Number
  },
  image: String,
  museumId: { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.model('MuseumObject', museumObjectSchema)