const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const User = require('../models/user')

const protect = asyncHandler(async (req, res) => {

    const token = req.cookies.token; //get token
    if (!token) {
        res.status(401);

        throw new Error('Not authorized !! please login !!')
    }

    //verify token 

    const verify = jwt.verify(token, process.env.WEB_TOKEN_SECRATE);

    if (!verify) {
        res.status(401);

        throw new Error('Not authorized !! please login !!')
    }

    const user = await User.findById(verify.cookies.id).select("-password");

    if (!user) {
        res.status(401);
        throw new error('Not authorized !! please login !!!')
    } else {
        req.user = user;
    }


})

module.exports = protect;