const mongoose = require('mongoose')

const ConnectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('Database Conenct to database Succesfully!')
    } catch (error) {
        console.log('Somthinkg went wrong, try again!')
        process.exit(1)
    }
}

module.exports = ConnectDB
