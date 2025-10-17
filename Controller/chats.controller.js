const { default: mongoose } = require("mongoose");
const MsgModel = require("../Model/message.model.js");
const { UserModel } = require("../Model/user.model.js");

const findChat = async (req, res) => {
    try {
        const { text } = req.body;
        const result = await MsgModel.find({
            message: { $regex: text, $options: 'i' }
        })
        return res.status(200).json({
            message: 'Messages find succesfully!',
            data: {
                result,
                Length: result.length
            }
        })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' })
    }
};

const getPrivateChatInbox = async (req, res) => {
    try {
        const userId = req.id;
        console.log(userId)

        const messages = await MsgModel.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new mongoose.Types.ObjectId(userId) },
                        { receiverId: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: '$conversationId',
                    lastMessageTime: { $first: '$createdAt' },
                    lastSender: { $first: '$senderId' },
                    lastReceiver: { $first: '$receiverId' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $eq: [{ $toObjectId: "$receiverId" }, new mongoose.Types.ObjectId(userId)] },
                                { $cond: [{ $eq: ["$read", false] }, 1, 0] },
                                0
                            ]
                        }
                    }
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ]);

        const otherUserIds = messages.map(conv =>
            conv._id
                ? conv._id.split('-').find(id => id !== userId)
                : conv.lastSender.toString() === userId
                    ? conv.lastReceiver.toString()
                    : conv.lastSender.toString()
        );

        const users = await UserModel.find({ _id: { $in: otherUserIds } }, 'username avatar');

        const result = messages.map((conv, index) => {
            const otherUser = users.find(u => u._id.toString() === otherUserIds[index]);
            return {
                conversationId: conv._id,
                username: otherUser?.username,
                avatar: otherUser?.avatar,
                unread: conv.unreadCount > 4 ? '4+' : conv.unreadCount,
                lastMessageTime: conv.lastMessageTime
            };
        });

        return res.status(200).json({ message: 'Inbox fetched successfully!', data: result });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

const getGroupChatIndox = async (req, res) => {
    try {
        const userId = req.id;
        const message = await MsgModel.aggregate([
            {
                $match: {
                    groupid: { $ne: null }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: 'groups',
                    localField: 'groupid',
                    foreignField: '_id',
                    as: 'group'
                }
            },
            {
                $unwind: '$group'
            },
            {
                $match: {
                    'group.members.memberdetail': new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $group: {
                    _id: '$groupid',
                    lastMessageTime: { $first: '$createdAt' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $eq: ['$read', false] },
                                1,
                                0
                            ]
                        }
                    },
                    groupName: { $first: '$group.gcname' },
                    groupAvatar: { $first: '$group.gcavatar' }
                }
            },
            {
                $sort: { lastMessageTime: -1 }
            }
        ])

        const result = message.map(conv => ({
            groupId: conv._id,
            groupName: conv.groupName,
            groupAvatar: conv.groupAvatar,
            unread: conv.unreadCount > 4 ? '4+' : conv.unreadCount,
            lastMessageTime: conv.lastMessageTime
        }))

        return res.status(200).json({
            message: 'Group inbox fetched successfully!',
            data: {
                result
            }
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error!' });
    }
};

const getUnreadAndRecentMsgs = async (req, res) => {
    try {
        const userId = req.id;
        const { receiverId, gcId } = req.query;

        if (!receiverId && !gcId) {
            return res.status(400).json({
                success: false,
                message: "receiverId or gcId is required!",
            });
        }

        let unreadMsgs = [];
        let recentReadMsgs = [];

        if (receiverId) {
            const conversationId = [receiverId, userId].sort().join('-');

            unreadMsgs = await MsgModel.find({
                conversationId,
                receiverId: userId,
                read: false
            })
                .sort({ createdAt: 1 });

            recentReadMsgs = await MsgModel.find({
                conversationId,
                $or: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                read: true
            })
                .sort({ createdAt: -1 })
                .limit(20);

        } else if (gcId) {
            unreadMsgs = await MsgModel.find({
                groupid: gcId,
                readBy: { $ne: userId }
            })
                .sort({ createdAt: 1 });

            recentReadMsgs = await MsgModel.find({
                groupid: gcId,
                readBy: userId
            })
                .sort({ createdAt: -1 })
                .limit(20);
        }

        return res.status(200).json({
            success: true,
            message: "Messages fetched successfully!",
            data: {
                unread: unreadMsgs,
                recent: recentReadMsgs.reverse(),
                totalUnread: unreadMsgs.length,
            }
        });

    } catch (error) {
        console.error("Error in getUnreadAndRecentMsgs:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching messages!",
        });
    }
}

const fetchOlderReadMessages = async (req, res) => {
    try {
        const userId = req.id;
        const { receiverId, gcId, lastMsgId } = req.body;

        if (!userId) return res.status(400).json({ success: false, message: "Login required!" });

        const filter = {};
        const limit = 30;

        if (receiverId) {
            const conversationId = [userId, receiverId].sort().join('-');
            filter = { conversationId, read: true }
        } else if (gcId) {
            filter = { gcId, readedBy: { $ne: [userId] } }
        } else {
            return res.status(400).json({ success: false, message: "ReceiverId or gcId required" });
        }

        if (lastMsgId) {
            const lastMsg = await MsgModel.findById(lastMsgId).select('createdAt');
            if (lastMsg) {
                filter.createdAt = { $lt: lastMsg.createdAt };
            }
        }

        const messages = await MsgModel
            .find(filter)
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('-__v -updatedAt');

        if (!messages.length) {
            return res.status(204).json({ success: true, message: 'No more messages' })
        }

        return res.status(200).json({
            success: true,
            message: 'Messages find successfully!',
            data: {
                messages
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

const fetchMessageContext = async (req, res) => {
    try {
        const userId = req.id;
        const { msgId, receiverId, gcId } = req.query;
        const limitBefore = 20;
        const limitAfter = 20;

        if (!msgId) {
            return res.status(400).json({ success: false, message: 'messageId are required!' });
        }

        if (!receiverId && !gcId) {
            return res.status(400).json({ success: false, message: 'receiverId or gcId are required!' });
        }

        const centerMsg = await MsgModel.findById(msgId);
        if (!centerMsg) return res.status(404).json({ success: false, message: 'Message not found!' });

        let chatQuery = {};
        if (receiverId) {
            const conversationId = [userId, receiverId].sort().join('-');
            chatQuery = { conversationId };
        } else if (gcId) {
            chatQuery = { groupId: gcId }
        }

        const beforeMessages = await MsgModel.find({
            ...chatQuery,
            createdAt: { $lt: centerMsg.createdAt }
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limitBefore));

        const afterMessages = await MsgModel.find({
            ...chatQuery,
            createdAt: { $gt: centerMsg.createdAt }
        })
            .sort({ createdAt: 1 })
            .limit(parseInt(limitAfter));

        const contextMsgs = [...beforeMessages.reverse(), centerMsg, ...afterMessages];

        return res.status(200).json({
            success: true,
            message: contextMsgs.length ? 'Fetched messages around the selected message' : 'No surrounding messages found',
            data: {
                contextMsgs
            }
        });

    } catch (error) {
        console.error('Error in fetchMessageContext:', error);
        return res.status(500).json({ success: false, message: 'Something went wrong!' });
    }
}

module.exports = {
    findChat,
    getPrivateChatInbox,
    getGroupChatIndox,
    getUnreadAndRecentMsgs,
    fetchOlderReadMessages,
    fetchMessageContext
}