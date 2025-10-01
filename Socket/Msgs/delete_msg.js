const GroupModel = require("../../Model/group.model.js");
const MsgModel = require("../../Model/message.model.js");

const DeleteMsg = async (MsgId, socket, io, OnlineUser) => {
    try {
        const FindMsg = await MsgModel.findById(MsgId);
        if (!FindMsg) return socket.emit('delete-message-error', { message: 'Message is not found!' });

        const requestingUserId = socket.data.userId

        if (FindMsg.senderId.toString() !== requestingUserId) {
            return socket.emit('delete-message-error', { message: 'You are not allowed to delete this message!' })
        }

        if (FindMsg.receiverId) {
            [FindMsg.senderId.toString(), FindMsg.receiverId.toString()].forEach(m => {
                if (OnlineUser.has(m)) {
                    for (let socketId of OnlineUser.get(m)) {
                        io.to(socketId).emit('message-deleted', { message: 'Message delete Succesfully!' })
                    }
                }
            })
        } else if (FindMsg.groupid) {
            const group = await GroupModel.findById(FindMsg.groupid);
            if (!group) return socket.emit('delete-message-error', { message: 'group dont found!' });

            group.members.forEach(m => {
                const userid = m.memberdetail.toString()
                if (OnlineUser.has(userid)) {
                    for (let socketId of OnlineUser.get(userid)) {
                        socket.to(socketId).emit('message-deleted', { message: 'Message delete Succesfully!' })
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

module.exports = DeleteMsg