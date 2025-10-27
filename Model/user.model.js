const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true
        },
        isonline: {
            type: String,
            required: true,
            default: false
        },
        lastseen: {
            type: Date,
            required: true,
            default: Date.now()
        },
        avatar: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

const UserModel = mongoose.model('user', UserSchema)

module.exports = { UserModel }