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

app.get('/', (req, res) => res.json({ status: 'ok' }))

app.listen(process.env.PORT, () => {
  console.log(`Back-office in ascolto su porta ${process.env.PORT}`)
})