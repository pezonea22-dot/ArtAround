const router = require('express').Router()
const Visit = require('../models/Visit')
const Item = require('../models/Item')
const auth = require('../middleware/auth')

// GET /api/visits?museumId=&targetLevel=
router.get('/', async (req, res) => {
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

// GET /api/visits/:id (con steps e item espansi)
router.get('/:id', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('author', 'username')
      .populate({ path: 'steps.objectId' })
      .populate({ 
        path: 'steps.items',
        model: 'Item',
        populate: { path: 'author', select: 'username' }
      })
    if (!visit) return res.status(404).json({ error: 'Visita non trovata' })
    
    // log temporaneo
    console.log('steps[0].items:', JSON.stringify(visit.steps[0]?.items, null, 2))
    
    res.json(visit)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/visits (solo autori)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'author') return res.status(403).json({ error: 'Non autorizzato' })
    const visit = await Visit.create({ ...req.body, author: req.user.id })
    res.status(201).json(visit)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /api/visits/:id (solo l'autore)
router.put('/:id', auth, async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
    if (!visit) return res.status(404).json({ error: 'Visita non trovata' })
    if (visit.author.toString() !== req.user.id) return res.status(403).json({ error: 'Non autorizzato' })
    const updated = await Visit.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/visits/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id)
    if (!visit) return res.status(404).json({ error: 'Visita non trovata' })
    if (visit.author.toString() !== req.user.id) return res.status(403).json({ error: 'Non autorizzato' })
    await visit.deleteOne()
    res.json({ message: 'Visita eliminata' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router