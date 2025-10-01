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

const socketAuth = (socket, next) => {
    try {
        // Read token from auth.token
        const token = socket.handshake.auth?.token || socket.handshake.query.token;

        if (!token) return next(new Error('Authentication error'));

        const decode = jwt.verify(token, process.env.JWT_KEY);
        if (!decode) return next(new Error('Invalid token'));

        const userId = decryptId(decode._id);
        socket.data.userId = userId;

        next();
    } catch (error) {
        console.log(error);
        next(new Error('Authentication error!'));
    }
}

module.exports = socketAuth