const { UserModel } = require("../Model/user.model.js")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const redisClient = require('../redis/connect.redis.js')
require('dotenv').config()

const key = Buffer.from(process.env.CRYPTO_KEY, 'hex');
const encryptId = (id) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(process.env.CRYPTO_ALGORITHM, key, iv);
    let encrypted = cipher.update(id.toString(), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
};

const Regitration = async (req, res) => {
    try {
        let { username, email, password } = req.body
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All feilds are required!' })
        }

        username = username.trim()
        email = email.trim()
        password = password.trim()

        const image = req.file
        if (!image) {
            return res.status(400).json({ message: 'File is required!' })
        }

        const FindEmail = await UserModel.findOne({ email })
        if (FindEmail) {
            return res.status(409).json({ message: 'Email already exist, try another one' })
        }

        const FindUsername = await UserModel.findOne({ username })
        if (FindUsername) {
            return res.status(409).json({ message: 'Username already exist, try another one' })
        }

        const HashPass = await bcrypt.hash(password, 10)

        const NewUser = new UserModel({
            username,
            email,
            password: HashPass,
            avatar: image.filename
        })

        await NewUser.save()

        await redisClient.del('allUsers');
        return res.status(201).json({ message: 'User Registartion Succesfully!' })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Somthinng went wrong, try again!' })
    }
}

const Login = async (req, res) => {
    try {
        let { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password is required!' })
        }

        email = email.trim()
        password = password.trim()

        const FindEmail = await UserModel.findOne({ email }).select('-updatedAt -createdAt -__v')
        if (!FindEmail) {
            return res.status(422).json({ message: "Email dont exist try another one!" })
        }

        const Unhashpass = await bcrypt.compare(password, FindEmail.password)
        if (!Unhashpass) {
            return res.status(422).json({ message: "Invalid Password!" })
        }

        const token = jwt.sign(
            {
                _id: encryptId(FindEmail._id)
            },
            process.env.JWT_KEY,
            {
                expiresIn: process.env.JWT_Exipry
            }
        )

        const modules = {
            HttpOnly: true,
            Secure: true,
            SameSite: 'None'
        }

        res.cookie('token', token, modules)

        return res.status(200).json({
            message: 'Login Succesfully!',
            data: {
                FindEmail
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Somthinng went wrong, try again!' })
    }
}

const FetchUserDatail = async (req, res) => {
    try {
        const id = req.id;
        const cacheKey = `user:${id}`;

        let user;
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            user = JSON.parse(cached);
        } else {
            user = await UserModel.findById(id).select('-password -createdAt -updatedAt -__v')
        }

    } catch (error) {
        return res.status(500).json({ message: 'Somthinng went wrong, try again!' })
    }
}

const FetchAllUsers = async (req, res) => {
    try {
        const LogedUserId = req.id
        const cacheKey = 'allUsers'

        const cached = await redisClient.get(cacheKey)
        if (cached) {
            return res.status(200).json({
                message: 'Users fetched successfully!',
                data: { FindUsers: JSON.parse(cached) },
                source: 'cache'
            });
        }

        const FindUsers = await UserModel.find({ _id: { $ne: LogedUserId } })

        if (FindUsers.length === 0) {
            return res.status(200).json({ message: "No users exist at this time", data: [] });
        }

        await redisClient.set(cacheKey, JSON.stringify(FindUsers), { EX: 600 })

        return res.status(200).json({
            message: 'Users FInd Succesfully!',
            data: {
                FindUsers
            }
        })

    } catch (error) {
        return res.status(500).json({ message: "Somthing went wrong, try again!" })
    }
}

module.exports = {
    Regitration,
    Login,
    FetchUserDatail,
    FetchAllUsers
}