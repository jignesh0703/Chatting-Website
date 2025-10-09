<<<<<<< HEAD
const mongoose = require('mongoose')

const GroupMsgsSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Types.ObjectId,
            ref: 'user'
        },
        groupid: {
            type: mongoose.Types.ObjectId,
            ref: 'group'
        },
        message: {
            type: String,
            required: true
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

const GroupMsgsModel = mongoose.model('group_chat', GroupMsgsSchema)
module.exports = GroupMsgsModel 
=======
// const mongoose = require('mongoose')

// const GroupMsgsSchema = new mongoose.Schema(
//     {
//         senderId: {
//             type: mongoose.Types.ObjectId,
//             ref: 'user'
//         },
//         groupid: {
//             type: mongoose.Types.ObjectId,
//             ref: 'group'
//         },
//         message: {
//             type: String,
//             required: true
//         },
//         edited: {
//             type: String,
//             default: false
//         }
//     },
//     {
//         timestamps: true
//     }
// )

// const GroupMsgsModel = mongoose.model('group_chat', GroupMsgsSchema)
// module.exports = GroupMsgsModel 
>>>>>>> 8b8c338 (Made other Emits)
