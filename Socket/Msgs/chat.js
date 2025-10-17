const { default: mongoose } = require("mongoose");
const GroupModel = require("../../Model/group.model.js");
const MsgModel = require("../../Model/message.model.js");
const Save_File = require("../FIle_upload/save_file.js");
const crypto = require('crypto');

const encrptKey = (key) => {
    const masterkey = Buffer.from(process.env.MASTER_KEY, 'hex');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(process.env.MASTER_ALGORITHM, masterkey, iv);
    const encrypted = Buffer.concat([cipher.update(key), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        key: encrypted.toString('hex')
    }
}

const encrpttMessages = (msg) => {
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(process.env.CHAT_ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(msg, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    const encryptedKey = encrptKey(key)
    return {
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        content: encrypted.toString('hex'),

        // encrypt key data
        keyinfo: {
            key: encryptedKey.key,
            iv: encryptedKey.iv,
            tag: encryptedKey.tag
        }
    };
}

const chat_emit = async (socket, onlineUser, io, msg, receiverId, gcId, files) => {
    try {
        const senderId = socket.data.userId;

        // Helper to process files
        const processFiles = async (files) => {
            if (!files) return null;
            if (Array.isArray(files)) {
                const processed = await Promise.all(files.map(f => Save_File(f)));
                return processed.filter(f => f !== null);
            }
            const single = await Save_File(files);
            return single ? [single] : null;
        };

        // Function to save message with retry
        const saveMessage = async (messageObj, retry = 3, delay = 1000) => {
            try {
                const savedMsg = await MsgModel.create(messageObj);
                console.log('Message saved:', savedMsg._id);
                return savedMsg;
            } catch (error) {
                if (retry > 0) {
                    console.log(`Retry saving message, attempts left: ${retry}`);
                    return new Promise(res => setTimeout(() => res(saveMessage(messageObj, retry - 1, delay)), delay));
                } else {
                    throw error;
                }
            }
        };

        const encryptedMsgStr = msg ? JSON.stringify(encrpttMessages(msg)) : null;

        if (receiverId) {
            // Private chat
            let conversationId = [senderId, receiverId].sort().join('-');
            const processedfile = await processFiles(files);

            const MsgToSend = {
                senderId,
                receiverId,
                conversationId,
                message: encryptedMsgStr,
                files: processedfile,
                readBy: null
            };

            const savedMsg = await saveMessage(MsgToSend);

            // Emit to receiver if online
            if (onlineUser.has(receiverId)) {
                for (let sockId of onlineUser.get(receiverId)) {
                    io.to(sockId).emit('chats', { success: true, data: savedMsg });
                }
            }

            // Emit to other sender sockets (if multi-device)
            if (onlineUser.has(senderId)) {
                for (let sockId of onlineUser.get(senderId)) {
                    io.to(sockId).emit('my-chats', { success: true, data: savedMsg });
                }
            }

        } else if (gcId) {
            // Group chat
            console.log('Group chat start...');
            const group = await GroupModel.findById(gcId);
            if (!group) return socket.emit('chat-error', { success: false, message: 'Group not found!' });

            const isMember = group.members.some(m => m.memberdetail.toString() === senderId);
            if (!isMember) return socket.emit('chat-error', { success: false, message: `You are not member of this ${group.gcname}` });

            const processedfile = await processFiles(files);
            const newmsg = {
                senderId,
                groupid: gcId,
                message: encryptedMsgStr,
                files: processedfile,
                readBy: [senderId]
            };

            const savedMsg = await saveMessage(newmsg);

            socket.emit('my-chats', { success: true, data: savedMsg });

            if (onlineUser.has(senderId)) {
                for (let sockId of onlineUser.get(senderId)) {
                    if (sockId !== socket.id) {
                        io.to(sockId).emit('my-chats', { success: true, data: savedMsg });
                    }
                }
            }

            group.members.forEach(m => {
                const memberid = m.memberdetail.toString();
                if (memberid === senderId) return; // skip sender
                if (onlineUser.has(memberid)) {
                    for (let socketid of onlineUser.get(memberid)) {
                        io.to(socketid).emit('chats', { success: true, data: savedMsg });
                    }
                }
            });

        } else {
            return socket.emit('chat-error', { success: false, message: 'ReceiverId or GcId is required!' });
        }

    } catch (error) {
        console.error(`Error in chat_emit:`, error);
        return socket.emit('chat-error', { success: false, message: 'Something went wrong!' });
    }
};

module.exports = chat_emit;