const router = require('express').Router()
const Item = require('../models/Item')
const auth = require('../middleware/auth')



// GET /api/items/:id
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.objectId && req.query.objectId !== 'null' && req.query.objectId !== 'undefined') {
      filter.objectId = req.query.objectId
    }
    if (req.query.level) filter.level = req.query.level
    if (req.query.duration) filter.duration = req.query.duration
    if (req.query.isPublic) filter.isPublic = req.query.isPublic === 'true'
    const items = await Item.find(filter)
      .populate('author', 'username')
      .populate('objectId', 'title artist')
      .sort({ level: 1, duration: 1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/items (solo autori)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'author') return res.status(403).json({ error: 'Non autorizzato' })
    const item = await Item.create({ ...req.body, author: req.user.id })
    res.status(201).json(item)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/items/mine — solo i miei item
router.get('/mine', auth, async (req, res) => {
  try {
    const items = await Item.find({ author: req.user.id })
      .populate('author', 'username')
      .populate('objectId', 'title artist')
      .sort({ level: 1, duration: 1 })
    res.json(items)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/items/:id (solo l'autore)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Item non trovato' })
    if (item.author.toString() !== req.user.id) return res.status(403).json({ error: 'Non autorizzato' })
    const updated = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/items/:id (solo l'autore)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ error: 'Item non trovato' })
    if (item.author.toString() !== req.user.id) return res.status(403).json({ error: 'Non autorizzato' })
    await item.deleteOne()
    res.json({ message: 'Item eliminato' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router