const express = require('express');
const { registerUser, loginUser, logOut, getSingleUser, getUser } = require('../controllers/user');
const protect = require('../middlewares/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logOut);
router.get('/getsingleuser/:id', getSingleUser);
// router.get('/loginstatus', LoginStatus)
router.get('/getuser', protect, getUser);


module.exports = router;