const express = require('express')
const { findChat, getPrivateChatInbox, getUnreadAndRecentMsgs, fetchOlderReadMessages, fetchMessageContext, getGroupChatIndox } = require('../Controller/chats.controller.js')
const { JWTAuth } = require('../Middellware/jwt.auth.js')

const chatRoutes = express.Router()

chatRoutes.post('/search', findChat)
chatRoutes.get('/fetchprivateinbox', JWTAuth, getPrivateChatInbox)
chatRoutes.get('/fetchgroupinbox', JWTAuth, getGroupChatIndox)
chatRoutes.get('/getunreadandrecentmsgs', JWTAuth, getUnreadAndRecentMsgs)
chatRoutes.get('/fetcholderreadmessages', JWTAuth, fetchOlderReadMessages)
chatRoutes.get('/fetchmessagecontext', fetchMessageContext)

module.exports = chatRoutes