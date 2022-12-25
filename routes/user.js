const express = require('express');
const { registerUser, loginUser, logOut, getUser } = require('../controllers/user');
const protect = require('../middlewares/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logOut);
router.get('/getuser/:id', protect, getUser);

module.exports = router;