const GroupModel = require("../../Model/group.model.js");
const MsgModel = require("../../Model/message.model.js");

const deleteMsg = async (MsgId, socket, io, onlineUser) => {
    try {
        const FindMsg = await MsgModel.findById(MsgId);
        if (!FindMsg) return socket.emit('delete-message-error', { message: 'Message is not found!' });

        const requestingUserId = socket.data.userId

        if (FindMsg.senderId.toString() !== requestingUserId) {
            return socket.emit('delete-message-error', { message: 'You are not allowed to delete this message!' })
        }

        if (FindMsg.receiverId) {
            [FindMsg.senderId.toString(), FindMsg.receiverId.toString()].forEach(m => {
                if (onlineUser.has(m)) {
                    for (let socketId of onlineUser.get(m)) {
                        io.to(socketId).emit('message-deleted', { message: 'Message deleted!' })
                    }
                }
            })
        } else if (FindMsg.groupid) {
            const group = await GroupModel.findById(FindMsg.groupid);
            if (!group) return socket.emit('delete-message-error', { message: 'group dont found!' });

            group.members.forEach(m => {
                const userid = m.memberdetail.toString()
                if (onlineUser.has(userid)) {
                    for (let socketId of onlineUser.get(userid)) {
                        socket.to(socketId).emit('message-deleted', { message: 'Message deleted!' })
                    }
                }
            })
        }

        const deleteMsg = async (retry = 3, delay = 100) => {
            try {
                await MsgModel.findByIdAndDelete(MsgId)
            } catch (error) {
                if (retry > 0) {
                    setTimeout(() => {
                        deleteMsg(retry - 1, delay)
                    }, delay);
                } else {
                    return socket.emit('delete-message-error', { message: 'Somthing went wrong while delete file!' })
                }
            }
        }

        deleteMsg()
        socket.emit('delete-sucessfully', { message: 'Message delete succesfully!' })

    } catch (error) {
        return socket.emit('delete-message-error', { message: 'Somthing went wrong, while deleting message!' })
    }
}

module.exports = deleteMsg