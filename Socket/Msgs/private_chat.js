// const MsgModel = require("../../Model/message.model.js");

// const PrivateChat = async (socket, receiverId, msg, onlineUser, io) => {
//     try {
//         const senderId = socket.data.userId;
//         let conversationId = [senderId, receiverId].sort().join('-');

//         const MsgToSend = {
//             senderId,
//             receiverId,
//             conversationId,
//             message: msg
//         }

//         const isReceiverOnline = onlineUser.has(receiverId);
//         if (isReceiverOnline) {
//             for (let sockId of onlineUser.get(receiverId)) {
//                 console.log('Online')
//                 io.to(sockId).emit('private-chat', {
//                     sucess: true,
//                     data: {
//                         MsgToSend
//                     }
//                 });
//             }
//         }

//         if (onlineUser.has(senderId)) {
//             for (let sockId of onlineUser.get(senderId)) {
//                 if (sockId !== socket.id) {
//                     io.to(sockId).emit('private-chat', {
//                         success: true,
//                         data: {
//                             MsgToSend
//                         }
//                     });
//                 }
//             }
//         }

//         const SaveMsg = async (retries = 3, delay = 1000) => {
//             try {
//                 const newmsg = await MsgModel.create(MsgToSend)
//                 console.log('Message saved to DB:', newmsg._id)
//             } catch (error) {
//                 if (retries > 0) {
//                     setTimeout(() => SaveMsg(retries - 1, delay), delay);
//                 } else {
//                     return socket.emit('private-chat-error', { success: false, message: 'Somthing went wrong while save msg' })
//                 }
//             }
//         }

//         SaveMsg()
//         console.log('private-chat', MsgToSend)

//     } catch (error) {
//         throw error
//     }
// }

// module.exports = PrivateChat