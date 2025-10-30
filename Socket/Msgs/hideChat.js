const UserModel = require("../../Model/user.model.js");

const hideChat = async (targetUserId, socket) => {
    try {
        const requestingUserId = socket.data.userId;

        if (!targetUserId && !groupId) {
            return socket.emit('hide-chat-error', { message: 'targetUserId or groupId is required!' });
        }

        let update = {};

        if (targetUserId) {
            update = { $addToSet: { hiddenUsers: targetUserId } };
        } else if (groupId) {
            update = { $addToSet: { hiddenGroups: groupId } };
        }

        await UserModel.findByIdAndUpdate(requestingUserId, update);


        return socket.emit('hide-chat-success', {
            message: targetUserId ? 'Private chat hidden successfully!' : 'Group chat hidden successfully!',
            targetUserId,
            groupId
        });

    } catch (error) {
        console.error('hideChat error:', error);
        return socket.emit('hide-chat-error', {
            message: 'Something went wrong!'
        });
    }
}

module.exports = hideChat