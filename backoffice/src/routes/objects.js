const router = require('express').Router()
const MuseumObject = require('../models/MuseumObject')
const auth = require('../middleware/auth')

// GET /api/objects?museumId=
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.museumId) filter.museumId = req.query.museumId
    const objects = await MuseumObject.find(filter).sort({ room: 1 })
    res.json(objects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/objects/:id
router.get('/:id', async (req, res) => {
  try {
    const object = await MuseumObject.findById(req.params.id)
    if (!object) return res.status(404).json({ error: 'Opera non trovata' })
    res.json(object)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/objects (solo autori)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'author') return res.status(403).json({ error: 'Non autorizzato' })
    const object = await MuseumObject.create(req.body)
    res.status(201).json(object)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router