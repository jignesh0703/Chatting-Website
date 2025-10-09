const mongoose = require('mongoose')

const GroupSchema = new mongoose.Schema(
    {
        gcname: {
            type: String,
            required: true
        },
        gcavatar: {
            type: String,
            required: true
        },
        totalmember: {
            type: Number,
            required: true
        },
        members: [
            {
                memberdetail: {
                    type: mongoose.Types.ObjectId,
                    ref: 'user',
                    require: true
                },
                isadmin: {
                    type: Boolean,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
)

const GroupModel = mongoose.model('group', GroupSchema)
module.exports = GroupModel