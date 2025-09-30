const express = require('express')
const upload = require('../middelware/multer.js')
<<<<<<< HEAD
const { Regitration, Login, FetchUserDatail, FetchAllUsers } = require('../Controller/user.controller.js')
=======
const { Regitration, Login, FetchUserDatail, FetchAllUsers, FetchChats } = require('../Controller/user.controller.js')
>>>>>>> 8b8c338 (Made other Emits)
const { JWTAuth } = require('../Middellware/jwt.auth.js')

const UserRoutes = express.Router()

UserRoutes.post('/registation', upload.single('image'), Regitration)
UserRoutes.post('/login', Login)
UserRoutes.get('/fetchuserdetail', JWTAuth, FetchUserDatail)
UserRoutes.get('/getalluser', JWTAuth, FetchAllUsers)
<<<<<<< HEAD
=======
UserRoutes.get('/getchats/:receiverId', JWTAuth, FetchChats)
>>>>>>> 8b8c338 (Made other Emits)

module.exports = { UserRoutes }