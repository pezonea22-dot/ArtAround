const mongoose = require('mongoose')

const logisticSchema = new mongoose.Schema({
  text: String,
  afterStepIndex: Number
})

const visitStepSchema = new mongoose.Schema({
  objectId: { type: mongoose.Schema.Types.ObjectId, ref: 'MuseumObject' },
  items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
})

const visitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  museumId: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetLevel: { type: String, enum: ['infantile', 'semplice', 'medio', 'avanzato'] },
  estimatedDuration: String,
  steps: [visitStepSchema],
  logistics: [logisticSchema],
  isPublic: { type: Boolean, default: true }
}, { timestamps: true })

module.exports = mongoose.model('Visit', visitSchema)