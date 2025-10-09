const MsgModel = require("../Model/message.model");

const findChat = async (req, res) => {
    try {
        const { text } = req.body;
        const result = await MsgModel.find({
            $text: { $search: text }
        })
        return res.status(200).json({
            message: 'Messages find succesfully!',
            data: {
                result
            }
        })
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error!' })
    }
}

module.exports = {
    findChat
}