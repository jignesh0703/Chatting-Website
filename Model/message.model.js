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
            default: null
        },
        files: [
            {
                url: { type: String },
                name: { type: String },
                type: { type: String }
            }
        ],
        groupid: {
            type: mongoose.Types.ObjectId,
            ref: 'group',
            default: null
        },
        message: {
            type: String,
            default: null
        },
        read: {
            type: Boolean,
            default: false
        },
        readBy: {
            type: mongoose.Types.ObjectId,
            ref: 'user',
            default: []
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

MsgSchema.index({ conversationId: 1, createdAt: -1 });
MsgSchema.index({ senderId: 1 });
MsgSchema.index({ receiverId: 1 });
MsgSchema.index({ groupid: 1 });
MsgSchema.index({ message: "text" });

const MsgModel = mongoose.model('message', MsgSchema)
module.exports = MsgModel