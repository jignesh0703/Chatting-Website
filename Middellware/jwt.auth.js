const { json } = require('express')
const jwt = require('jsonwebtoken')

const JWTAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(400).json({ message: 'Login is required!' })
        }

        const decode = jwt.decode(token, process.env.JWT_KEY)
        if (!decode) {
            return res.status(401).json({ message: 'Invalid token' })
        }

        req.id = decode._id
        next()

    } catch (error) {
        return res.status(502).json({ message: 'Login is required!' })
    }
}

module.exports = {
    JWTAuth
}