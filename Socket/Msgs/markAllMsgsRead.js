const MsgModel = require("../../Model/message.model.js");

const markAllMsgsRead = async (socket, senderId, gcId) => {
    try {
        const userId = socket.data.userId;
        if (!userId) return socket.emit('mark-all-read-error', { success: false, message: 'User not found' });

        if (senderId) {
            const conversationId = [userId, senderId].sort().join('-');
            await MsgModel.updateMany(
                { conversationId, senderId, receiverId: userId, read: false },
                { $set: { read: true } }
            )
        } else if (gcId) {
            await MsgModel.updateMany(
                { groupid: gcId, readBy: { $ne: userId } },
                { $push: { readBy: userId } }
            )
        } else {
            return socket.emit('mark-all-read-error', { success: false, message: 'senderId or gcId is required' });
        }

    } catch (error) {
        return socket.emit('mark-all-read-error', { message: error.message || 'Somthing went wrong!' })
    }
}

module.exports = markAllMsgsRead