const multer = require('multer')

const fs = require('fs')
const path = require('path')

const avatarDir = path.join(__dirname, '../Avatars')

if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage })

module.exports = upload