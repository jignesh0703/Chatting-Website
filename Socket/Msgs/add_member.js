const AddMeber = async (GCId, MemberId, socket, OnlineUser, io) => {
    try {
        const group = await GroupModel.findById(GCId)
        if (!group) return socket.emit('add-member-error', { message: 'Group dont found' });

        const requestingUserId = socket.data.userId

        const admin = group.members.find(m => m.memberdetail.toString() === requestingUserId && m.isadmin)
        if (!admin) {
            return socket.emit('add-member-error', { message: 'Only group admin can add members!' });
        }

        if (group.members.some(m => m.memberdetail.toString() === MemberId)) {
            return socket.emit('add-member-error', { message: 'Member already in group!' });
        }

        const newmemberdetail = { memberdetail: MemberId, isadmin: false }

        group.members.forEach(userId => {
            if (OnlineUser.has(userId)) {
                for (let socketId of OnlineUser.get(userId)) {
                    io.to(socketId).emit('member-added', { groupId: GCId, newMemberId: MemberId });
                }
            }
        });

        socket.emit('add-member-success', { groupId: GCId, newMemberId: MemberId });

        const savemember = async (retry = 3, delay = 1000) => {
            try {
                group.members.push(newmemberdetail);
                await group.save();
                console.log(`Member ${MemberId} saved in ${group.gcname}`);
            } catch (error) {
                if (retry > 0) {
                    setTimeout(() => {
                        savemember(retry - 1, delay)
                    }, delay);
                }
            }
        }

        savemember()

    } catch (error) {
        return socket.emit('add-member-error', { message: error.message || 'Somthing went wrong!' })
    }
}

module.exports = AddMeber