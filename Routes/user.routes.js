const express = require('express')
const upload = require('../middelware/multer.js')

const { Regitration, Login, FetchUserDatail, FetchAllUsers, FetchChats } = require('../Controller/user.controller.js')
const { JWTAuth } = require('../Middellware/jwt.auth.js')

const UserRoutes = express.Router()

UserRoutes.post('/registation', upload.single('image'), Regitration)
UserRoutes.post('/login', Login)
UserRoutes.get('/fetchuserdetail', JWTAuth, FetchUserDatail)
UserRoutes.get('/getalluser', JWTAuth, FetchAllUsers)
UserRoutes.get('/getchats', JWTAuth, FetchChats)

module.exports = { UserRoutes }