const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const User = require('../models/user')

const protect = asyncHandler(async (req, res, next) => {

    try {
        const token = req.cookies.token; //get token
        if (!token) {
            res.status(401);

            throw new Error('Not authorized !! please login !!1')
        }

        //verify token 

        const verify = jwt.verify(token, process.env.JWT_TOKEN_SECRATE);

        if (!verify) {
            res.status(401);

            throw new Error('Not authorized !! please login !!2')
        }

        const user = await User.findById(verify.id).select("-password");

        if (!user) {
            res.status(401);
            throw new error('user not found')
        } else {
            req.user = user;
            next();
        }

    } catch {
        res.status(401);
        throw new Error("Not authorized, please login3");
    }




})

module.exports = protect;