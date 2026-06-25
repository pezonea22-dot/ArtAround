const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connesso'))
  .catch(err => console.error(err))

app.use('/auth', require('./routes/auth'))
app.use('/api/objects', require('./routes/objects'))
app.use('/api/items', require('./routes/items'))
app.use('/api/visits', require('./routes/visits'))
app.use('/api/marketplace', require('./routes/marketplace'))

app.get('/', (req, res) => res.json({ status: 'ok', app: 'ArtAround API' }))

app.listen(process.env.PORT, () => {
  console.log(`Back-office in ascolto su porta ${process.env.PORT}`)
})

const path = require('path')

app.get('/museum-config', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../config/museum.json'))
})