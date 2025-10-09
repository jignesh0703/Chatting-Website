const GroupModel = require("../../Model/group.model.js");

const addMeber = async (GCId, MemberIds, socket, onlineUser, io) => {
    try {
        const group = await GroupModel.findById(GCId)
        if (!group) {
            return socket.emit('add-gc-member', { sucess: false, message: 'Group dont found' });
        }
        const requestingUserId = socket.data.userId

        for (const MemberId of MemberIds) {
            console.log(group.members, MemberId)
            if (group.members.some(m => m.memberdetail.toString() === MemberId)) {
                socket.emit('add-member-error', { sucess: false, message: 'Member already in group!' });
                continue;
            }

            const newmemberdetail = { memberdetail: MemberId, isadmin: false }

            for (const member of group.members) {
                const userIdStr = member.memberdetail.toString();
                if (userIdStr === MemberId.toString()) continue; // skip new member
                if (onlineUser.has(userIdStr)) {
                    for (const socketId of onlineUser.get(userIdStr)) {
                        console.log('notify existing member', userIdStr, socketId);
                        io.to(socketId).emit('member-added', {
                            success: true,
                            data: { groupId: GCId, newMemberId: MemberId }
                        });
                    }
                }
            }

            // --- Notify the newly added member (if online) ---
            const newMemberKey = MemberId.toString();
            if (onlineUser.has(newMemberKey)) {
                for (const socketId of onlineUser.get(newMemberKey)) {
                    io.to(socketId).emit('added-to-group', {
                        success: true,
                        data: { groupId: GCId, addedBy: requestingUserId }
                    });
                }
            }

            socket.emit('add-member-success', {
                success: true,
                data: {
                    groupId: GCId,
                    newMemberId: MemberId
                }
            });

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

           await savemember()
        }

    } catch (error) {
        return socket.emit('add-member-error', { message: error.message || 'Somthing went wrong!' })
    }
}

module.exports = addMeber