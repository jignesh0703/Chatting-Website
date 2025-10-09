const GroupModel = require("../../Model/group.model.js");

const exitGC = async (GCId, socket) => {
    try {
        const group = await GroupModel.findById(GCId);
        if (!group) {
            return socket.emit('exit-gc-error', { success: false, message: 'Group not found' });
        }

        const requestingUserId = socket.data.userId;

        const memberIndex = group.members.findIndex(
            m => m.memberdetail.toString() === requestingUserId
        );

        if (memberIndex === -1) {
            return socket.emit('exit-gc-error', { success: false, message: 'You are not a member of this group!' });
        }

        if (group.members.length === 1) {
            await GroupModel.findByIdAndDelete(GCId);
            return socket.emit('exit-gc-success', { success: true, message: 'You left and group was deleted (last member).' });
        }

        const isAdmin = group.members[memberIndex].isadmin;

        group.members.splice(memberIndex, 1);
        group.totalmember = group.members.length;

        if (isAdmin) {
            const anyAdminLeft = group.members.some(m => m.isadmin === true);
            if (!anyAdminLeft && group.members.length > 0) {
                group.members[0].isadmin = true;
            }
        }

        await group.save();

        socket.emit('exit-gc-success', {
            success: true,
            message: 'You have left the group successfully!'
        });

    } catch (error) {
        console.error('Exit GC Error:', error);
        socket.emit('exit-gc-error', {
            success: false,
            message: 'Something went wrong while leaving the group!'
        });
    }
};

module.exports = exitGC