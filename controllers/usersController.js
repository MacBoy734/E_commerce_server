const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')


// CREATE TOKEN FUNCTION

const createtoken = (id, username, isAdmin) => {
    return jwt.sign({ id, username, isAdmin }, process.env.JWT_COOKIE_SECRET)
}

// LOGOUT ROUTE
module.exports.logoutGet = (req, res) => {
    res.cookie('jwt', '', {
        path: '/',
        httpOnly: true,
        sameSite: "none",
        secure: process.env.IS_PRODUCTION,
        maxAge: 1
    })
    res.status(200).end()
}

// GET ALL USERS ROUTE
module.exports.usersGet = async (req, res) => {
    try{
        const users = await userModel.find({}, { password: 0 })
        res.status(200).json(users)
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

// CHANGE USERS ROLE
module.exports.changeRoleGet = async (req, res) => {
    try{
      const {id} = req.params
      if(!id){
        return res.status(400).json({error: 'missing or invalid id'})
      }
      const user = await userModel.findOne({ _id: id })
      if(!user || user === null){
        return res.status(404).json({error: 'the user cannot be found'})
      }else{
        await userModel.updateOne({ _id: user._id }, { $set: { isAdmin: !user.isAdmin} })
      }

      res.status(200).json(user)
    }catch(err){
        res.status(500).json({error: err.message})
    }
}

// LOGIN ROUTE
module.exports.loginPost = [
    body('username').trim().escape(),
    body('password').trim().escape()
, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    try {
        let { username, password } = req.body
        user = await userModel.login(username, password)
        let token = createtoken(user._id, user.username, user.isAdmin)
        res.cookie('jwt', token, {
            maxAge: 3600000 * 120,
            httpOnly: true,
            sameSite: "none",
            secure: process.env.IS_PRODUCTION,
            path: '/'
        })
        if (user) res.status(200).json(user)
    } catch (err) {
        res.status(401).json({ message: err.message })
    }
}]

module.exports.registerPost = [
    body('username').trim().escape(),
    body('password').trim().escape(),
    body('phone').trim().escape(),
    body('email').isEmail().normalizeEmail()
, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { username, password, email, phone} = req.body
    if(!username || !password ||!email || !phone)return res.status(400).json({message: "please enter all the details!"})
    const newUser = new userModel({
        username,
        password,
        email,
        phone
    })
    try {
        const userExists = await userModel.findOne({ username })
        const emailExists = await userModel.findOne({ email })
        if (userExists !== null) {
            return res.status(409).json({ message: 'the username is already taken!' })
        }
        if (emailExists !== null) {
            return res.status(409).json({ message: 'the email is already registered!' })
        }
        const user = await newUser.save()
        let token = createtoken(user._id, user.username, user.isAdmin)
        res.cookie('jwt', token, {
            path: '/',
            httpOnly: true,
            sameSite: "none",
            secure: process.env.IS_PRODUCTION,
            maxAge: 3600000 * 120
        })
        if (user) res.status(201).json(user)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}]