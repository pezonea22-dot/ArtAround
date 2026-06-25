const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body
    const user = await User.create({ username, password, role })
    res.status(201).json({ message: 'Utente creato', userId: user._id })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (!user) return res.status(401).json({ error: 'Credenziali non valide' })
    const ok = await user.comparePassword(password)
    if (!ok) return res.status(401).json({ error: 'Credenziali non valide' })
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router