const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  objectId: { type: mongoose.Schema.Types.ObjectId, ref: 'MuseumObject', required: true },
  text: { type: String, required: true },
  duration: { type: String, enum: ['3s', '15s', '1min', '4min'], required: true },
  level: { type: String, enum: ['infantile', 'semplice', 'medio', 'avanzato'], required: true },
  language: { type: String, default: 'it' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  license: { type: String, enum: ['free', 'cc-by', 'paid'], default: 'free' },
  price: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  image: String
}, { timestamps: true })

module.exports = mongoose.model('Item', itemSchema)