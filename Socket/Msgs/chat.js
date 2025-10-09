const GroupModel = require("../../Model/group.model.js");
const MsgModel = require("../../Model/message.model.js");
const Save_File = require("../FIle_upload/save_file.js");

const chat_emit = async (socket, onlineUser, io, msg, receiverId, gcId, files) => {
    try {
        const senderId = socket.data.userId;

        if (receiverId) {
            let conversationId = [senderId, receiverId].sort().join('-');

            let processedfile = null;
            if (files) {
                if (Array.isArray(files)) {
                    // Wait for all files to save
                    processedfile = (await Promise.all(files.map(f => Save_File(f)))).filter(f => f !== null);
                } else {
                    const singlefile = await Save_File(files);
                    processedfile = singlefile ? [singlefile] : null;
                }
            }

            const MsgToSend = {
                senderId,
                receiverId,
                conversationId,
                message: msg || '',
                files: processedfile
            }

            console.log(`MSGTOSEND: ${JSON.stringify(MsgToSend)}`);

            const isReceiverOnline = onlineUser.has(receiverId);
            if (isReceiverOnline) {
                for (let sockId of onlineUser.get(receiverId)) {
                    console.log('Online')
                    io.to(sockId).emit('chats', {
                        success: true,
                        data: {
                            MsgToSend
                        }
                    });
                }
            }

            if (onlineUser.has(senderId)) {
                for (let sockId of onlineUser.get(senderId)) {
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
                    console.log
                    const newmsg = await MsgModel.create(MsgToSend)
                    console.log(newmsg)
                    console.log('Message saved to DB:', newmsg._id)
                } catch (error) {
                    if (retries > 0) {
                        setTimeout(() => SaveMsg(retries - 1, delay), delay);
                    } else {
                        console.log(error)
                        return socket.emit('private-chat-error', { success: false, message: 'Somthing went wrong while save msg' })
                    }
                }
            }

            await SaveMsg()
            console.log('private-chat', MsgToSend)

        } else if (gcId) {
            console.log('Group chat start...')
            const group = await GroupModel.findById(gcId);
            if (!group) return socket.emit('chat-error', { success: false, message: 'Group not found!' });

            const senderId = socket.data.userId;
            const isMember = group.members.some(m => m.memberdetail.toString() === senderId);
            if (!isMember) return socket.emit('chat-error', { success: false, message: `You are not member of this ${group.gcname}` });

            let processedfile = null;
            if (files) {
                if (Array.isArray(files)) {
                    // Wait for all files to save
                    processedfile = (await Promise.all(files.map(f => Save_File(f)))).filter(f => f !== null);
                } else {
                    const singlefile = await Save_File(files);
                    processedfile = singlefile ? [singlefile] : null;
                }
            }

            const newmsg = {
                senderId: senderId,
                groupid: gcId,
                message: msg || '',
                files: processedfile
            }

            group.members.forEach(m => {
                const memberid = m.memberdetail.toString();
                if (memberid === senderId) return;
                if (onlineUser.has(memberid)) {
                    for (let socketid of onlineUser.get(memberid)) {
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
        console.log(`Error : ${error}`)
        return socket.emit('chat-error', { success: false, message: 'Somthing went wrong!' })
    }
}

module.exports = chat_emit