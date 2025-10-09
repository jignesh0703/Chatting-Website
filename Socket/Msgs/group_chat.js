// const MsgModel = require("../../Model/message.model.js");

// const GroupChat = async (GCId, mesg, socket, onlineUser, io) => {
//     try {
//         const group = await GroupModel.findById(GCId);
//         if (!group) return socket.emit('group-chat-error', { message: 'Group not found!' });

//         const senderId = socket.data.userId;
//         const isMember = group.some(m => m.memberdetail.toString() === senderId);
//         if (!isMember) return socket.emit('group-chat-error', { message: `You are not member of this ${group.gcname}` });

//         const newmsg = {
//             senderId: senderId,
//             groupid: GCId,
//             message: mesg,
//             edited: false
//         }

//         group.members.forEach(m => {
//             const memberid = m.memberdetail.toString();
//             if (onlineUser.has(memberid)) {
//                 for (let socketid of onlineUser.get(memberid)) {
//                     io.to(socketid).emit('new-group-message', newmsg)
//                 }
//             }
//         })

//         const SaveMsg = async (retry = 3, delay = 1000) => {
//             try {
//                 await MsgModel.create(newmsg)
//             } catch (error) {
//                 if (retry > 0) {
//                     setTimeout(() => {
//                         SaveMsg(retry - 1, delay)
//                     }, delay);
//                 } else {
//                     return socket.emit('group-chat-error', { message: '' })
//                 }
//             }
//         }

//         SaveMsg()

//     } catch (error) {
//         return socket.emit('group-chat-error', { message: 'Somthing went wrong while convertion in chat!' })
//     }
// }

// module.exports = GroupChat