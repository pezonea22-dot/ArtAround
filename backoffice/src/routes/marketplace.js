const router = require('express').Router()
const Item = require('../models/Item')
const Visit = require('../models/Visit')
const auth = require('../middleware/auth')

// GET /api/marketplace/items?level=&duration=&search=
router.get('/items', async (req, res) => {
  try {
    const filter = { isPublic: true }
    if (req.query.level) filter.level = req.query.level
    if (req.query.duration) filter.duration = req.query.duration
    if (req.query.search) filter.text = { $regex: req.query.search, $options: 'i' }
    const items = await Item.find(filter)
      .populate('author', 'username')
      .populate('objectId', 'title artist museumId')
      .sort({ createdAt: -1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/marketplace/visits?museumId=&targetLevel=
router.get('/visits', async (req, res) => {
  try {
    const filter = { isPublic: true }
    if (req.query.museumId) filter.museumId = req.query.museumId
    if (req.query.targetLevel) filter.targetLevel = req.query.targetLevel
    const visits = await Visit.find(filter)
      .populate('author', 'username')
      .select('-steps')
      .sort({ createdAt: -1 })
    res.json(visits)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
router.post('/items/:id/adopt', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Item non trovato' })
    if (!item.isPublic) return res.status(403).json({ error: 'Item non pubblico' })
    const adopted = await Item.create({
      objectId: item.objectId,
      text:     item.text,
      duration: item.duration,
      level:    item.level,
      language: item.language,
      author:   req.user.id,
      license:  item.license,
      price:    0,
      isPublic: false,
    })
    res.status(201).json(adopted)
  } catch(err) {
    res.status(500).json({ error: err.message })
  }
})
module.exports = router