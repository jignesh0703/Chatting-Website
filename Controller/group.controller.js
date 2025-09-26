const GroupModel = require("../Model/group.model")

const CreateGC = async (req, res) => {
    try {
        const id = req.id
        if (!id) {
            return res.status(401).json({ message: 'Authentication required!' })
        }

        const { gcname } = req.body
        if (!gcname) {
            return res.status(400).json({ message: 'Group name is required!' })
        }

        const CheckGCName = await GroupModel.findOne({ gcname })
        if (CheckGCName) {
            return res.status(400).json({ message: 'Group name already exists, please choose another name.' })
        }

        const image = req.file
        if (!image) {
            return res.status(400).json({ message: 'Group image is required!' })
        }

        const NewGC = new GroupModel({
            gcname,
            gcavatar: image.filename,
            totalmember: 1,
            members: [
                {
                    memberdetail: id,
                    isadmin: true
                }
            ]
        })
        await NewGC.save()
        return res.status(201).json({ message: 'New Group Created Succesfully!', NewGC })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Somthink went wrong try again!' })
    }
}

const ListAllGC = async (req, res) => {
    try {
        const FindGCs = await GroupModel.find()
        return res.status()
    } catch (error) {
        return res.status(500).json({ message: 'Somthink went wrong try again!' })
    }
}

module.exports = {
    CreateGC
}