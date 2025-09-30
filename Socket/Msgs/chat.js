const GroupModel = require("../../Model/group.model.js");
const MsgModel = require("../../Model/message.model.js");

const Chat_emit = async (socket, OnlineUser, io, msg, receiverId, gcId) => {
    try {
        const senderId = socket.data.userId;

        if (receiverId) {
            console.log('Private chat start...')
            let conversationId = [senderId, receiverId].sort().join('-');
            const MsgToSend = {
                senderId,
                receiverId,
                conversationId,
                message: msg
            }

            const isReceiverOnline = OnlineUser.has(receiverId);
            if (isReceiverOnline) {
                for (let sockId of OnlineUser.get(receiverId)) {
                    console.log('Online')
                    io.to(sockId).emit('chats', {
                        sucess: true,
                        data: {
                            MsgToSend
                        }
                    });
                }
            }

            if (OnlineUser.has(senderId)) {
                for (let sockId of OnlineUser.get(senderId)) {
                    if (sockId !== socket.id) {
                        io.to(sockId).emit('chats', {
                            success: true,
                            data: {
                                MsgToSend
                            }
                        });
                    }
                }
            }

            const SaveMsg = async (retries = 3, delay = 1000) => {
                try {
                    const newmsg = await MsgModel.create(MsgToSend)
                    console.log(newmsg)
                    console.log('Message saved to DB:', newmsg._id)
                } catch (error) {
                    if (retries > 0) {
                        setTimeout(() => SaveMsg(retries - 1, delay), delay);
                    } else {
                        return socket.emit('private-chat-error', { success: false, message: 'Somthing went wrong while save msg' })
                    }
                }
            }

            SaveMsg()
            console.log('private-chat', MsgToSend)

        } else if (gcId) {
            const group = await GroupModel.findById(gcId);
            if (!group) return socket.emit('chat-error', { success: false, message: 'Group not found!' });

            const senderId = socket.data.userId;
            const isMember = group.members.some(m => m.memberdetail.toString() === senderId);
            if (!isMember) return socket.emit('chat-error', { success: false, message: `You are not member of this ${group.gcname}` });

            const newmsg = {
                senderId: senderId,
                groupid: gcId,
                message: msg,
                edited: false
            }

            group.members.forEach(m => {
                const memberid = m.memberdetail.toString();
                if (memberid === senderId) return;
                if (OnlineUser.has(memberid)) {
                    for (let socketid of OnlineUser.get(memberid)) {
                        io.to(socketid).emit('chats', {
                            success: true,
                            data: {
                                newmsg
                            }
                        })
                    }
                }
            })

            const SaveMsg = async (retry = 3, delay = 1000) => {
                try {
                    const savedMsg = await MsgModel.create(newmsg);
                    console.log('Message saved:', savedMsg._id);
                } catch (error) {
                    console.error("Error while saving message:", error.message);

                    if (retry > 0) {
                        console.log(`Retrying... attempts left: ${retry}`);
                        setTimeout(() => {
                            SaveMsg(retry - 1, delay);
                        }, delay);
                    } else {
                        socket.emit('chat-error', {
                            success: false,
                            message: 'Error while saving message, you are going to lose this message!'
                        });
                    }
                }
            };

            SaveMsg();
            console.log(`Group-chat ${group.gcname}`, newmsg)

        } else {
            return socket.emit('chat-error', { success: false, message: 'ReceiverId or GcId is required!' })
        }

    } catch (error) {
        return socket.emit('chat-error', { success: false, message: 'Somthing went wrong!' })
    }
}

module.exports = Chat_emit