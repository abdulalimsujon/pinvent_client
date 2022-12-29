const express = require('express');
const { registerUser, loginUser, logOut, getSingleUser, getUser, LoginStatus, updateUser, updatedPassword, forgotPassword, resetPassword } = require('../controllers/user');
const protect = require('../middlewares/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logOut);
router.get('/getsingleuser/:id', getSingleUser);
router.get('/loginstatus', LoginStatus)
router.patch('/updateuser', protect, updateUser)
router.get('/getuser', protect, getUser);
router.patch('/updatedpassword', protect, updatedPassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword)


module.exports = router;