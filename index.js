const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const ConnectDB = require('./ConnectDB.js/connectdb.js')
const { UserRoutes } = require('./Routes/user.routes.js')
const GroupRoutes = require('./Routes/group.routes.js')

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/images', express.static('Avatars/'))

app.use('/api/user', UserRoutes)
app.use('/api/gc', GroupRoutes)

ConnectDB()
    .then(
        app.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`)
        })
    )
