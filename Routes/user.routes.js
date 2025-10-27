const express = require('express')
const upload = require('../middelware/multer.js')

const { Regitration, Login, FetchUserDatail, FetchAllUsers, findUser } = require('../Controller/user.controller.js')
const { JWTAuth } = require('../Middellware/jwt.auth.js')

const UserRoutes = express.Router()

UserRoutes.post('/registation', upload.single('image'), Regitration)
UserRoutes.post('/login', Login)
UserRoutes.get('/fetchuserdetail', JWTAuth, FetchUserDatail)
UserRoutes.get('/getalluser', JWTAuth, FetchAllUsers)
UserRoutes.post('/getuser', JWTAuth, findUser)

module.exports = { UserRoutes }