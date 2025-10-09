const GroupModel = require("../../Model/group.model.js");

const removeMember = async (GCId, MemberId, socket, onlineUser, io) => {
    try {
        const group = await GroupModel.findById(GCId);
        if (!group) return socket.emit('remove-member-error', { message: `Group don't found!` });

        const requestingUserId = socket.data.userId

        const admin = group.members.find(m => m.memberdetail.toString() === requestingUserId && m.isadmin)
        if (!admin) {
            return socket.emit('remove-member-error', { message: 'User dont allow to remove user, Only admins can do!' })
        }

        if (!group.members.some(m => m.memberdetail.toString() === MemberId)) {
            return socket.emit('remove-member-error', { message: `Member dont exist in ${group.gcname}` })
        }

        group.members.forEach(m => {
            const UserID = m.memberdetail.toString()
            if (onlineUser.has(UserID)) {
                io.to(socket.id).emit('remover-member', {
                    success: true,
                    message: 'Member kick succesfully!'
                })
            }
        })

        group.members = group.members.filter(m => m.memberdetail.toString() !== MemberId)
        await group.save()

    } catch (error) {
        socket.emit('remove-member-error', { message: error.message || 'Somthinkg went wrong' })
    }
}

module.exports = removeMember