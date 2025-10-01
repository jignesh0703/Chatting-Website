const { Server } = require('socket.io')
const PrivateChat = require('./Msgs/private_chat.js')
const EditMsgs = require('./Msgs/edit_msg.js')
const GroupModel = require('../Model/group.model.js')
const AddMeber = require('./Msgs/add_member.js')
const GroupChat = require('./Msgs/group_chat.js')
const DeleteMsg = require('./Msgs/delete_msg.js')
const Chat_emit = require('./Msgs/chat.js')

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
            Chat_emit(socket, OnlineUser, io, values.msg, values.receiverId, values.gcid,values.files)
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