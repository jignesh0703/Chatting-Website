const mongoose = require('mongoose')

const MsgSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Types.ObjectId,
            ref: 'user'
        },
        receiverId: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            default: null
        },
        conversationId: {
            type: String,
            required: true,
            default: null
        },
        groupid: {
            type: mongoose.Types.ObjectId,
            ref: 'group',
            default: null
        },
        message: {
            type: String,
            required: true
        },
        read: {
            type: Boolean,
            default: false
        },
        edited: {
            type: String,
            default: false
        }
    },
    {
        timestamps: true
    }
)

const MsgModel = mongoose.model('message', MsgSchema)
module.exports = MsgModel