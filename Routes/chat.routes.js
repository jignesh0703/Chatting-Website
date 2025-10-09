const express = require('express')
const { findChat } = require('../Controller/chats.controller.js')

const chatRoutes = express.Router()

chatRoutes.post('/search', findChat)

module.exports = chatRoutes