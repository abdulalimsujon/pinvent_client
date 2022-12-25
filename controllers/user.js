const asyncHandler = require("express-async-handler");

var jwt = require('jsonwebtoken');

const User = require('../models/user')
const bcrypt = require('bcryptjs');






//create token

const generateToken = (id) => {

    return jwt.sign({ id }, process.env.JWT_TOKEN_SECRATE, { expiresIn: "7d" });
}

//register user


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;



    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be up to 6 characters");
    }


    // Check if user email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("Email has already been registered");
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    //   Generate Token
    const token = generateToken(user._id);

    //Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 1000 * 86400), // 7 day
        sameSite: "none",
        // secure: true,
    });

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(201).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }

})



// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate Request
    if (!email || !password) {
        res.status(400);
        throw new Error("Please add email and password");
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400);
        throw new Error("User not found, please signup");
    }

    // User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    //   Generate Token
    const token = generateToken(user._id);

    // Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        // secure: true,
    });

    if (user && passwordIsCorrect) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid email or password");
    }
});

//logOut user 

const logOut = asyncHandler(async (req, res) => {

    res.cookie('token', '', {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none"

    })

    return res.status(200).json({ msg: 'successfully logged Out' })

})

// get single User 

const getSingleUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.params.id);

    const { _id, name, email, password, photo, bio } = user;

    if (user) {
        res.status(200).json({
            _id,
            name,
            email,
            password,
            photo,
            bio
        })

    } else {
        res.json(400);
        throw new error('user not found!!')
    }

})
// Get User Data

const getUser = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
        });
    } else {
        res.status(400);
        throw new Error("User Not Found");
    }
});

// get login status 
const LoginStatus = asyncHandler(async (req, res) => {

    const token = req.cookies.token;
    if (!token) {
        return res.json(false)
    } else {
        return res.json(true)
    }

    const verified = jwt.verify(token, process.env.JWT_TOKEN_SECRATE)

    if (!verified) {
        return res.json(false)

    } else {
        return res.json(true)
    }

})

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);


    if (user) {
        const { name, email, photo, phone, bio } = user;

        user.email = email,
            user.name = req.body.name || name,
            user.photo = req.body.photo || photo,
            user.phone = req.body.phone || phone,
            user.bio = req.body.bio || bio

        const updatedUser = await user.save();

        res.status(200).json({

            _id: updatedUser._id,
            name: updatedUser.name,
            email: updateUser.email,
            photo: updateUser.photo,
            phone: updateUser.phone,
            bio: updateUser.bio
        })

    } else {
        res.status(404)
        throw new Error('user not found');
    }


})




module.exports = {
    registerUser,
    loginUser,
    logOut,
    getSingleUser,
    getUser,
    LoginStatus,
    updateUser
}