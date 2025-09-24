const { Server } = require('socket.io')
const cors = require('cors')
const MsgModel = require('../Model/message.model.js')

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

        socket.on('private-chat', async ({ receiverId, msg }) => {
            const senderId = socket.data.userId;
            let conversationId = [senderId, receiverId].sort().join('-');

            const NewMsg = await MsgModel.create({
                senderId,
                receiverId,
                conversationId,
                message: msg
            });

            const isReceiverOnline = OnlineUser.has(receiverId);

            const msgToSend = {
                ...NewMsg.toObject(),
                online: isReceiverOnline
            };

            if (isReceiverOnline) {
                for (let sockId of OnlineUser.get(receiverId)) {
                    io.to(sockId).emit('private-chat', msgToSend);
                }
            }

            if (OnlineUser.has(senderId)) {
                for (let sockId of OnlineUser.get(senderId)) {
                    if (sockId !== socket.id) {
                        io.to(sockId).emit('private-chat', msgToSend);
                    }
                }
            }
        });

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