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

        group.members = group.members.filter(m => m.memberdetail.toString() !== MemberId);
        await group.save();

        socket.emit('remove-member-success', {
            success: true,
            message: `Member removed successfully from ${group.gcname}!`
        });

        const removedUserKey = MemberId.toString();
        if (onlineUser.has(removedUserKey)) {
            for (const socketId of onlineUser.get(removedUserKey)) {
                io.to(socketId).emit('removed-from-group', {
                    success: false,
                    data: { groupId: GCId, removedBy: requestingUserId },
                    message: `You were removed from ${group.gcname}.`
                });
            }
        } else {
            console.log(`Removed member ${MemberId} is offline.`);
        }

        for (const m of group.members) {
            const userId = m.memberdetail.toString();
            if (onlineUser.has(userId)) {
                io.to(onlineUser.get(userId)).emit('member-removed-update', {
                    groupId: GCId,
                    removedMemberId: MemberId,
                    message: `A member was removed from the group.`
                });
            }
        }

    } catch (error) {
        socket.emit('remove-member-error', { message: error.message || 'Somthinkg went wrong' })
    }
}

module.exports = removeMember