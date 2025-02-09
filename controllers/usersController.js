const jwt = require('jsonwebtoken')
const userModel = require('../models/userModel')
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator')
const Newsletter = require('../models/newsletter')
const newsletter = require('../models/newsletter')


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
    try {
        const users = await userModel.find({}, { password: 0 })
        res.status(200).json(users)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// GET USER ORDERS
module.exports.userOrdersGet = async (req, res) => {
    try {
        const { id } = req.params
        console.log(id)
        if (!id) {
            return res.status(400).json({ error: 'please include the id!' })
        }
        const user = await userModel.findById(id)
        if (!user) {
            return res.status(404).json({ error: 'the user was not found' })
        } else {
            userOrders = await userModel.findById(user._id).select('orderHistory').populate({ path: 'orderHistory', select: '-updatedAt -user -shippingAddress -email -city -postalCode' })
            console.log(userOrders)
            res.status(200).json(userOrders)
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// CHANGE USERS ROLE
module.exports.changeRoleGet = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ error: 'missing or invalid id' })
        }
        const user = await userModel.findOne({ _id: id })
        if (!user || user === null) {
            return res.status(404).json({ error: 'the user cannot be found' })
        } else {
            await userModel.updateOne({ _id: user._id }, { $set: { isAdmin: !user.isAdmin } })
        }

        res.status(200).json(user)
    } catch (err) {
        res.status(500).json({ error: err.message })
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
            res.status(401).json({ error: err.message })
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
        const { username, password, email, phone } = req.body
        if (!username || !password || !email || !phone) return res.status(400).json({ error: "please enter all the details!" })
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
                return res.status(409).json({ error: 'the username is already taken!' })
            }
            if (emailExists !== null) {
                return res.status(409).json({ error: 'the email is already registered!' })
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
            res.status(500).json({ error: error.message })
        }

    }]

module.exports.forgotPasswordPost = async (req, res) => {
    const email = req.body.email
    try {
        const user = await userModel.findOne({ email })
        if (!user) return res.status(404).json({ error: 'this email is not registered!' })
        const token = jwt.sign({ id: user._id }, process.env.JWT_COOKIE_SECRET, { expiresIn: '10m' })
        const resetUrl = `https://macboystore.netlify.app/auth/resetpassword?token=${token}`
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        const mailOptions = {
            from: `"Mac Boy" <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: `Password Reset`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #0275d8; text-align: center;">Reset Your Password</h2>
                <p>Hello ${user.username},</p>
                <p>Hey am so sorry that you lost your password. Click the button below to reset your password. <strong>This link will expire in 10 minutes.</strong></p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="${resetUrl}" style="background-color: #0275d8; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 5px;">
                        Reset Password
                    </a>
                </div>
                <p>If the button above doesn’t work, you can also click the link below:</p>
                <p style="word-break: break-word; color: #0275d8;">
                    <a href="${resetUrl}" style="color: #0275d8; text-decoration: none;">${resetUrl}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 0.9rem; color: #666;">
                    If you did not request a password reset, you can safely ignore this email.
                </p>
                <br>
                <small>This is an automated response! Please don't reply to this email.</small>
                <br>
                <p style="font-size: 0.9rem; color: #666;">Thank you,<br>The Mac Boy Team</p>
            </div>
        `

        }

        // Send the confirmation email
        transporter.sendMail(mailOptions, (error, Info) => {
            if (error) {
                console.log(error.message)
                res.status(500).json({ error: 'There was an error sending the reset token' })
            } else {
                res.status(200).send({ message: "link succesfully sent!" })
            }
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports.resetPasswordPost = async (req, res) => {
    const { password, token } = req.body
    if (!token) return res.status(400).json({ error: 'Token is required' })
    if (!password) return res.status(400).json({ error: 'Password is required!' })

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_COOKIE_SECRET)
        const user = await userModel.findById(decodedToken.id)
        if (!user) return res.status(404).json({ error: 'User not found' })


        user.password = password
        await user.save()

        res.status(200).json({ message: 'Password changed successfully, use it to login' })
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired Link!' })
    }
}

module.exports.newsletterPost = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) return res.status(400).json({ error: 'Email is required' })

        const exists = await Newsletter.findOne({ email })
        if (exists) return res.status(400).json({ error: "You're already subscribed!" })

        await Newsletter.create({ email })

        return res.status(200).json({ message: "Subscribed successfully!" })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}
module.exports.sendNewsletterPost = async (req, res) => {
    const { subject, body } = req.body;

    if (!subject || !body) {
        return res.status(400).json({ error: "please enter all details" })
    }
    try {
        const users = await newsletter.find().select('email -_id');
        console.log(users)
        if(users.length > 0){
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASS,
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            await Promise.all(
                users.map(async (user) => {
                    const mailOptions = {
                        from: `"Mac Boy" <${process.env.EMAIL_USERNAME}>`,
                        to: user.email,
                        subject,
                        text: body,
                    };
    
                    await transporter.sendMail(mailOptions);
                })
            );
            res.status(200).json({ message: "Newsletter sent successfully!" });
        }else{
            return res.status(400).json({error: 'there is no enough users!'})
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to send the newsletter." });
    }
}