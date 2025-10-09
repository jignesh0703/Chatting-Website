const express = require('express')
const cookieParser = require('cookie-parser')
const { UserRoutes } = require('./Routes/user.routes.js')
const GroupRoutes = require('./Routes/group.routes.js')
const chatRoutes = require('./Routes/chat.routes.js')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/images', express.static('Avatars/'))

app.use('/api/user', UserRoutes)
app.use('/api/gc', GroupRoutes)
app.use('/api/search', chatRoutes)

module.exports = app