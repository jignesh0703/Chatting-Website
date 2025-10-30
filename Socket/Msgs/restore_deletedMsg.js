const MsgModel = require("../../Model/message.model.js");

const restoreMsg = async (MsgId, socket) => {
  try {
    const FindMsg = await MsgModel.findById(MsgId);
    if (!FindMsg)
      return socket.emit("restore-message-error", {
        message: "Message not found!",
      });

    const requestingUserId = socket.data.userId;

    if (FindMsg.senderId.toString() !== requestingUserId) {
      return socket.emit("restore-message-error", {
        message: "You are not allowed to restore this message!",
      });
    }

    if (!FindMsg.isDeleted) {
      return socket.emit("restore-message-error", {
        message: "Message is not deleted!",
      });
    }

    if (Date.now() - new Date(FindMsg.deletedAt).getTime() > 10000) {
      return socket.emit("restore-message-error", {
        message: "Undo time expired!",
      });
    }

    await MsgModel.findByIdAndUpdate(MsgId, {
      isDeleted: false,
      deletedAt: null,
    });

    socket.emit("restore-success", {
      messageId: MsgId,
      message: "Message restored successfully!",
    });
  } catch (error) {
    console.error(error);
    return socket.emit("restore-message-error", {
      message: "Something went wrong while restoring the message!",
    });
  }
};

module.exports = restoreMsg;