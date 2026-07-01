const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connesso')
    const User = require('./models/User')
    const count = await User.countDocuments()
    if (count === 0) {
      console.log('DB vuoto — eseguo seed automatico...')
      try {
        const seedFn = require('../../db-seed/seed-fn')
        await seedFn(mongoose)
        console.log('Seed completato')
      } catch(e) {
        console.error('Errore seed:', e.message)
      }
    }
  })
  .catch(err => console.error(err))

app.use('/auth', require('./routes/auth'))
app.use('/api/objects', require('./routes/objects'))
app.use('/api/items', require('./routes/items'))
app.use('/api/visits', require('./routes/visits'))
app.use('/api/marketplace', require('./routes/marketplace'))

app.get('/museums', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../config/museums.json'))
})

app.get('/museum-config', (req, res) => {
  const id = req.query.id
  if (id) {
    res.sendFile(path.resolve(__dirname, `../../config/${id}.json`))
  } else {
    res.sendFile(path.resolve(__dirname, '../../config/galleria-estense.json'))
  }
})

app.get('/', (req, res) => res.json({ status: 'ok', app: 'ArtAround API' }))

app.listen(process.env.PORT, () => {
  console.log(`Back-office in ascolto su porta ${process.env.PORT}`)
})