const jwt = require('jsonwebtoken')
const crypto = require('crypto')
require('dotenv').config()

const key = Buffer.from(process.env.CRYPTO_KEY, 'hex');
const decryptId = (encryptedId) => {
    const [ivHex, encrypted] = encryptedId.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(process.env.CRYPTO_ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

const JWTAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(400).json({ message: 'Login is required!' })
        }

        const decode = jwt.verify(token, process.env.JWT_KEY)
        if (!decode) {
            return res.status(401).json({ message: 'Invalid token' })
        }

        const userId = decryptId(decode._id);
        req.id = userId
        next()

    } catch (error) {
        console.log(error)
        return res.status(502).json({ message: 'Login is required!' })
    }
}

module.exports = {
    JWTAuth
}