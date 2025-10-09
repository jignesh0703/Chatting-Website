const GroupModel = require("../../Model/group.model.js")

const remove_admin = async (socket, io, gcid, memberid) => {
    try {
        const group = await GroupModel.findById(gcid);
        if (!group) {
            return socket.emit('remove-admin-error', { success: false, message: 'Group dont found!' })
        }

        const requestingUserId = socket.data.userId

        const isadmin = group.members.some(m => m.memberdetail.toString() === requestingUserId)
        if (!isadmin) {
            return socket.emit('remove-admin-error', { success: false, message: 'Youn are not allowed, Only admin can!' })
        }

        const member = group.members.find(m => m.memberdetail.toString() === memberid)
        if (!member) {
            return socket.emit('remove-admin-error', { success: false, message: `Member dont exixt in ${group.gcname}` })
        }

        if (!member.isadmin) {
            return socket.emit('remove-admin-error', { success: false, message: 'This member is not an admin!' })
        }

        const totalAdmins = group.members.filter(m => m.isadmin).length
        if (totalAdmins <= 1) {
            return socket.emit('remove-admin-error', {
                success: false,
                message: 'You cannot remove the last admin!'
            })
        }

        member.isadmin = false
        group.save()

        socket.emit('remove-admin-success', { success: true, message: 'Admin rights removed successfully!' })
        io.to(gcid).emit('group-update', { message: `Member ${memberid} is no longer an admin!` })

        console.log(`❌ Member ${memberid} removed from admin in group ${gcid}`)

    } catch (error) {
        return socket.emit('remove-admin', { success: false, message: 'SOmthink went wrong, try again!' })
    }
}

module.exports = remove_admin