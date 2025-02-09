const express = require('express')
const { loginPost, registerPost, logoutGet, usersGet, changeRoleGet, forgotPasswordPost, resetPasswordPost, userOrdersGet, newsletterPost, sendNewsletterPost } = require('../controllers/usersController')
const {authenticateUser, checkIfIsAdmin} = require('../middleware/auth')
const router = express.Router()

router.get('/logout', logoutGet)
router.get('/', authenticateUser, checkIfIsAdmin, usersGet)
router.get('/:id/orders', authenticateUser, userOrdersGet)
router.get('/:id/changerole', authenticateUser, checkIfIsAdmin, changeRoleGet)

router.post('/login', loginPost)
router.post('/register', registerPost)
router.post('/forgotpassword', forgotPasswordPost)
router.post('/newsletter', newsletterPost)
router.post('/sendnewsletter', authenticateUser, checkIfIsAdmin, sendNewsletterPost)
router.post('/resetpassword', resetPasswordPost)
module.exports = router