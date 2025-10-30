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
            type: Boolean,
            required: true,
            default: false
        },
        lastseen: {
            type: Date,
            required: true,
            default: new Date
        },
        avatar: {
            type: String,
            required: true
        },
        hiddenUsers: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'user'
            }
        ],
        hiddenGroups: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'group'
            }
        ],
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