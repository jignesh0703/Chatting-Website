const GroupModel = require("../../Model/group.model.js")

const gave_Adimin = async (memberid, gcid, socket, io) => {
    try {
        const requestingUserId = socket.data.userId

        const group = await GroupModel.findById(gcid).select('-createdAt -updatedAt -__v')
        if (!group) {
            console.log('Group dont found!')
            return socket.emit('gave-admin-error', { success: false, message: `Group don't exixt` })
        }

        const isadmin = group.members.some(m => m.memberdetail.toString() === requestingUserId && m.isadmin === true)
        if (!isadmin) {
            return socket.emit('gave-admin-error', { success: false, message: 'You are not allowed!' })
        }

        const member = group.members.find(m => m.memberdetail.toString() === memberid)
        if (!member) {
            return socket.emit('gave-admin-error', { success: false, message: 'Member not found in this group!' })
        }

        if(member.isadmin){
            return socket.emit('gave-admin-error', { success: false, message: 'This member is already an admin!' })
        }

        member.isadmin = true
        await group.save()

        socket.emit('gave-admin-success', { success: true, message: 'Admin rights granted successfully!' })
        io.to(gcid).emit('group-update', { message: `Member ${memberid} is now an admin!` }) // broadcast to group

        console.log(`✅ Member ${memberid} promoted to admin in group ${gcid}`)

    } catch (error) {
        return socket.emit('gave-admin-error', { success: false, message: 'Somthink went wrong while making admin, try again!' })
    }
}

module.exports = gave_Adimin