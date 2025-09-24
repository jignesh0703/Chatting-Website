const dotenv = require('dotenv')
const http = require('http')
const ConnectDB = require('./ConnectDB.js/connectdb.js')
const socketAuth = require('./Socket/middelware.js')
const initSocket = require('./Socket/io.js')
const app = require('./app.js')

dotenv.config()

const PORT = process.env.PORT
const server = http.createServer(app)

initSocket(server, socketAuth)

ConnectDB()
    .then(
        server.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`)
        })
    )