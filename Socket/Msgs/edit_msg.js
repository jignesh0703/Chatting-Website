const GroupModel = require("../../Model/group.model.js")
const MsgModel = require("../../Model/message.model.js")

const editMsgs = async (mesgId, NewMsg, onlineUser, io, socket) => {
    try {
        const FindMsg = await MsgModel.findById(mesgId)
        if (!FindMsg) {
            return socket.emit('edit-msg-error', { success: false, message: 'Incorrect message id!' })
        }

        const requestingUserId = socket.data.userId

        if (FindMsg.senderId.toString() !== requestingUserId) {
            return socket.emit('edit-msg-error', { success: false, message: 'User not allowed to edit message!' })
        }

        const EditedMsg = {
            ...FindMsg.toObject(),
            message: NewMsg,
            edited: true
        }

        if (FindMsg.receiverId) {
            const senderId = FindMsg.senderId.toString();
            const receiverId = FindMsg.receiverId.toString();

            [senderId, receiverId].forEach(userId => {
                if (onlineUser.has(userId)) {
                    for (let socketId of onlineUser.get(userId)) {
                        io.to(socketId).emit('message-edited', {
                            success: true,
                            data: {
                                EditedMsg
                            }
                        })
                    }
                }
            })
        } else if (FindMsg.groupid) {
            const group = await GroupModel.findById(FindMsg.groupid);
            if (!group) return socket.emit('edit-msg-error', { message: 'Group dont found!' });

            group.members.forEach(m => {
                const memberid = m.memberdetail.toString()
                if (onlineUser.has(memberid)) {
                    for (let socketId of onlineUser.get(memberid)) {
                        io.to(socketId).emit('message-edited', {
                            success: false,
                            data: {
                                EditedMsg
                            }
                        })
                    }
                }
            })

        }

        const saveEdit = async (retry = 3, delay = 1000) => {
            try {
                FindMsg.message = NewMsg
                FindMsg.edited = true
                await FindMsg.save()
                console.log("Message edit saved:", mesgId);
            } catch (error) {
                if (retry > 0) {
                    setTimeout(() => {
                        saveEdit(retry - 1, delay)
                    }, delay);
                } else {
                    return socket.emit('edit-msg-error', { success: false, message: 'Something went wrong while saving edit!' })
                }
            }
        }

        saveEdit()

    } catch (error) {
        socket.emit('edit-msg-error', { success: false, message: 'Something went wrong while saving edit!' });
    }
}

module.exports = editMsgs