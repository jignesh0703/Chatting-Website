const { Server } = require('socket.io')
<<<<<<< HEAD
const PrivateChat = require('./Msgs/private_chat.js')
const EditMsgs = require('./Msgs/edit_msg.js')
const GroupModel = require('../Model/group.model.js')
const AddMeber = require('./Msgs/add_member.js')
const GroupChat = require('./Msgs/group_chat.js')
const DeleteMsg = require('./Msgs/delete_msg.js')
=======
const EditMsgs = require('./Msgs/edit_msg.js')
const AddMeber = require('./Msgs/add_member.js')
const DeleteMsg = require('./Msgs/delete_msg.js')
const RemoveMember = require('./Msgs/remove_member.js')
const Chat_emit = require('./Msgs/chat.js')
const Gave_Adimin = require('./Msgs/gave_admin.js')
const Remove_admin = require('./Msgs/remove_admin.js')
>>>>>>> 8b8c338 (Made other Emits)

let OnlineUser = new Map()

// setInterval(() => console.log(OnlineUser), 2000)

function initSocket(server, socketAuth) {
    const io = new Server(server, {
        cors: {
            origin: '*',
            credentials: true
        }
    })

    io.use(socketAuth)

    io.on("connection", (socket) => {
        const senderId = socket.data.userId
        console.log(`A new connnection is created : ${socket.id}`)

        if (!OnlineUser.has(senderId)) OnlineUser.set(senderId, new Set())
        OnlineUser.get(senderId).add(socket.id)

<<<<<<< HEAD
        socket.on('private-chat', async ({ receiverId, msg }) => {
            PrivateChat(socket, receiverId, msg, OnlineUser, io)
        });

        socket.on('edit-msg', async ({ mesgId, NewMsg }) => {
            EditMsgs(mesgId, NewMsg, OnlineUser, io, socket)
        })

        socket.on('add-gc-member', async ({ GCId, MemberId }) => {
            AddMeber(GCId, MemberId, socket, OnlineUser, io)
        })

        socket.on('remove-gc-member', async ({ GCId, MemberId }) => {
            try {
                const group = await GroupModel.findById(GCId);
                if (!group) return socket.emit('remove-member-error', { message: `Group don't found!` });

                const requestingUserId = socket.data.userId

                const admin = group.members.find(m => m.memberdetail.toString() === requestingUserId && m.isadmin)
                if (!admin) return socket.emit('remove-member-error', { message: 'User dont allow to remove user, Only admins can do!' });

                if (group.members.some(m => m.memberdetail.toString() === MemberId)) {
                    return socket.emit('remove-member-error', { message: `Member dont exist in ${group.gcname}` })
                }

                group.members = group.members.filter(m => m.memberdetail.toString() !== MemberId)
                await group.save()

                group.members.forEach(m => {
                    const UserID = m.memberdetail.toString()
                    if (OnlineUser.has(UserID)) {
                        io.to(socket)
                    }
                })


            } catch (error) {
                socket.emit('remove-member-error', { message: error.message || 'Somthinkg went wrong' })
            }
        })

        socket.on('group-chat', async ({ GCId, mesg }) => {
            GroupChat(GCId, mesg, socket, OnlineUser, io)
        })

        socket.on('delete-messgae', async ({ MsgId }) => {
            DeleteMsg(MsgId, socket, io, OnlineUser)
=======
        // socket.on('private-chat', async (data) => {
        //     let values = data;
        //     if (typeof data === "string") {
        //         values = JSON.parse(data);
        //     }
        //     PrivateChat(socket, values.receiverId, values.msg, OnlineUser, io)
        // });

        socket.on('edit-msg', async (data) => {
            let values = data;
            if (typeof data === "string") {
                values = JSON.parse(data)
            }
            EditMsgs(values.mesgId, values.NewMsg, OnlineUser, io, socket)
        })

        socket.on('add-gc-member', async (data) => {
            let values = data;
            if (typeof data === 'string') {
                values = JSON.parse(data)
            }
            console.log(`Values : ${values.GCId} , ${values.MemberIds}`)
            AddMeber(values.GCId, values.MemberIds, socket, OnlineUser, io)
        })

        socket.on('remove-gc-member', async (data) => {
            let values = data
            if (typeof data === 'string') {
                values = JSON.parse(data)
            }
            RemoveMember(values.GCId, values.MemberId, socket, OnlineUser, io)
        })

        socket.on('chats', async (data) => {
            let values = data
            if (typeof data === 'string') {
                values = JSON.parse(data)
            }
            console.log(values)
            Chat_emit(socket, OnlineUser, io, values.msg, values.receiverId, values.gcid)
        })

        // socket.on('group-chat', async (data) => {
        //     let values = data
        //     if (typeof data === 'string') {
        //         values = JSON.parse(data)
        //     }
        //     GroupChat(values.GCId, values.mesg, socket, OnlineUser, io)
        // })

        socket.on('delete-messgae', async (data) => {
            let values = data
            if (typeof data === 'string') {
                values = JSON.parse(data)
            }
            DeleteMsg(values.MsgId, socket, io, OnlineUser)
        })

        socket.on('gave-admin', async (data) => {
            let values = data
            if (typeof values === 'string') {
                values = JSON.parse(data)
            }
            Gave_Adimin(values.memberid, values.gcid, socket, io)
        })

        socket.on('remove-admin', async (data) => {
            console.log('processing....')
            let values = data
            if (typeof values === 'string') {
                values = JSON.parse(data)
            }
            Remove_admin(socket, io, values.gcid, values.memberid)
>>>>>>> 8b8c338 (Made other Emits)
        })

        socket.on('disconnect', () => {
            console.log('New connection close')
            if (OnlineUser.has(senderId)) {
                OnlineUser.get(senderId).delete(socket.id)

                // If no tabs left, remove user from OnlineUser
                if (OnlineUser.get(senderId).size === 0) {
                    OnlineUser.delete(senderId);
                }
            }
        })
    })
}

module.exports = initSocket




// socket.on('mark-as-read', async ({ conversationId, senderId }) => {
//     const receiverId = socket.data.userId;

//     // Update unread messages for this conversation
//     await MsgModel.updateMany(
//         { conversationId, senderId, receiverId, read: false },
//         { read: true }
//     );

//     // Notify sender(s) that messages are read
//     if (OnlineUser.has(senderId)) {
//         for (let sockId of OnlineUser.get(senderId)) {
//             io.to(sockId).emit('messages-read', { conversationId, receiverId });
//         }
//     }
// });

<<<<<<< HEAD


// socket.on('edit-message', async ({ messageId, newText }) => {
//     const updatedMsg = await MsgModel.findByIdAndUpdate(
//         messageId,
//         { message: newText, edited: true },
//         { new: true }
//     );

//     const senderId = updatedMsg.senderId.toString();
//     const receiverId = updatedMsg.receiverId.toString();

//     // Notify all active sockets of sender and receiver
//     [senderId, receiverId].forEach(userId => {
//         if (OnlineUser.has(userId)) {
//             for (let sockId of OnlineUser.get(userId)) {
//                 io.to(sockId).emit('message-edited', updatedMsg);
//             }
//         }
//     });
// });
=======
// {
//     "receiverId" : "68da5041445abbdca46b9f72",
//     "msg" : "HELLO"
// }
>>>>>>> 8b8c338 (Made other Emits)
