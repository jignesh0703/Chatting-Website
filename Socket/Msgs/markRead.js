const MsgModel = require("../../Model/message.model.js");

const markReadMsgs = async (socket, messagesId) => {
    try {
        const userId = socket.data.userId;
        if (!messagesId || messagesId.length === 0) return;

        const messages = await MsgModel.find({ _id: { $in: messagesId } });

        for (let msg of messages) {
            if (msg.receiverId && !msg.groupid) {
                if (!msg.read && msg.receiverId.toString() === userId) {
                    msg.read = true;
                    await msg.save();
                }
            } else if (msg.groupid) {
                if (!msg.readBy) msg.readBy = [];
                if (!msg.readBy.includes(userId)) {
                    msg.readBy.push(userId);
                    await msg.save();
                }
            }
        }

    } catch (error) {
        return socket.emit('read-mark-error', { message: error.message || 'Somthing went wrong!' })
    }
}

module.exports = {
    markReadMsgs
}