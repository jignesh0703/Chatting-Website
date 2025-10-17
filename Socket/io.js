const { Server } = require('socket.io')
const editMsgs = require('./Msgs/edit_msg.js')
const addMeber = require('./Msgs/add_member.js')
const deleteMsg = require('./Msgs/delete_msg.js')
const chat_emit = require('./Msgs/chat.js')
const removeMember = require('./Msgs/remove_member.js')
const gave_Adimin = require('./Msgs/gave_admin.js')
const remove_admin = require('./Msgs/remove_admin.js')
const exitGC = require('./Msgs/exit_gc.js')
const markReadMsgs = require('./Msgs/markRead.js')
const markAllMsgsRead = require('./Msgs/markAllMsgsRead.js')

let onlineUser = new Map()

// setInterval(() => {
//     console.log(onlineUser)
// }, 2000)

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

        if (!onlineUser.has(senderId)) onlineUser.set(senderId, new Set())
        onlineUser.get(senderId).add(socket.id)
        // socket.on('private-chat', async (data) => {
        //     let values = data;
        //     if (typeof data === "string") {
        //         values = JSON.parse(data);
        //     }
        //     PrivateChat(socket, values.receiverId, values.msg, onlineUser, io)
        // });

        socket.on('edit-msg', async (data) => {
            let values = data;
            if (typeof data === "string") {
                values = JSON.parse(data)
            }
            editMsgs(values.mesgId, values.NewMsg, onlineUser, io, socket)
        })

        socket.on('add-gc-member', async (data) => {
            let values = data;
            if (typeof data === 'string') {
                values = JSON.parse(data)
            }
            console.log(`Values : ${values.GCId} , ${values.MemberIds}`)
            addMeber(values.GCId, values.MemberIds, socket, onlineUser, io)
        })

        socket.on('remove-gc-member', async (data) => {
            let values = data
            if (typeof data === 'string') {
                values = JSON.parse(data)
            }
            removeMember(values.GCId, values.MemberId, socket, onlineUser, io)
        })

        socket.on('chats', async (data) => {
            let values = data
            if (typeof data === 'string') {
                values = JSON.parse(data)
            }
            chat_emit(socket, onlineUser, io, values.msg, values.receiverId, values.gcid, values.files)
        })

        // socket.on('group-chat', async (data) => {
        //     let values = data
        //     if (typeof data === 'string') {
        //         values = JSON.parse(data)
        //     }
        //     GroupChat(values.GCId, values.mesg, socket, onlineUser, io)
        // })

        socket.on('delete-messgae', async (data) => {
            let values = data
            if (typeof data === 'string') {
                values = JSON.parse(data)
            }
            deleteMsg(values.MsgId, socket, io, onlineUser)
        })

        socket.on('gave-admin', async (data) => {
            let values = data
            if (typeof values === 'string') {
                values = JSON.parse(data)
            }
            gave_Adimin(values.memberid, values.gcid, socket, io)
        })

        socket.on('remove-admin', async (data) => {
            console.log('processing....')
            let values = data
            if (typeof values === 'string') {
                values = JSON.parse(data)
            }
            remove_admin(socket, io, values.gcid, values.memberid)
        })

        socket.on('exit-gc', async (data) => {
            let values = data;
            if (typeof values === 'string') {
                values = JSON.parse(data)
            }
            exitGC(values.gcid, socket)
        })

        socket.on('mark-as-seen', async (data) => {
            let values = data;
            if (typeof values === 'string') {
                values = JSON.parse(data)
            }
            markReadMsgs(socket, messagesId)
        })

        socket.on('mark-all-messages-read', async (data) => {
            let values = data;
            if (typeof values === 'string') {
                values = JSON.parse(data)
            }
            markAllMsgsRead(socket)
        })

        socket.on('disconnect', () => {
            console.log('New connection close')
            if (onlineUser.has(senderId)) {
                onlineUser.get(senderId).delete(socket.id)

                // If no tabs left, remove user from onlineUser
                if (onlineUser.get(senderId).size === 0) {
                    onlineUser.delete(senderId);
                }
            }
        })
    })
}

module.exports = initSocket