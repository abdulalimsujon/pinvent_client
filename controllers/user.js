const asyncHandler = require("express-async-handler");

var jwt = require('jsonwebtoken');

const User = require('../models/user')
const bcrypt = require('bcryptjs');
const Token = require('../models/token')
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


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

/// updated user 

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



// updated password 

const updatedPassword = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id)

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        res.status(400);
        throw new Error('Please add old and new password');
    }

    if (!user) {
        res.status(400);
        throw new Error('please login !!')
    }

    if (user && oldPassword && newPassword) {
        user.password = newPassword;

        await user.save();

        res.status(200).json('password updated successfully')

    } else {
        res.status(400)
        throw new Error('provide all')
    }



})

// forget password 

const forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;
    const user = await User.findOne({ email: email });

    if (!user) {
        res.status(404)
        throw new Error("user not found !!")
    }

    const token = await Token.findOne({ userId: user._id })

    if (token) {
        await token.deleteOne();
    }

    //create rest token

    let resetToken = crypto.randomBytes(32).toString('hex') + user._id;

    console.log('====>', resetToken);

    //hash the token

    const hashToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest('hex')

    console.log('=========++>', hashToken)


    // save token to DB

    await new Token({
        userId: user._id,
        token: hashToken,
        createAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000),


    }).save()

    //construct reset email

    const resetUrl = `${process.env.FRONTED_URL}/resettoken/${resetToken}`
    console.log('===', resetUrl);

    //resetEmail

    const message = `

    <h1>hellow ${user.name}<h1>
    <p>Please use the url below to reset your password</p>  
    <p>This reset link is valid for only 30minutes.</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    <p>Regards...</p>
    <p>Pinvent Team</p>
`

    const subject = "Password Reset Request";
    const send_to = user.email;
    const send_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, send_from);
        res.status(200).json({ success: true, message: "Reset Email Sent" });
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent, please try again");
    }
})


//   reset password

const resetPassword = asyncHandler(async (req, res) => {

    const { password } = req.body;
    const { resetToken } = req.params;

    //hash token 

    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")


    // find token in DB

    const getUser = await Token.findOne({
        token: hashedToken,

        expiresAt: { $gt: Date.now() },

    })

    if (!getUser) {
        throw new Error('Invalid or expired Token')
    }


    // find user 

    const user = await User.findOne({ _id: getUser.userId });

    user.password = password;

    await user.save();

    res.status(200).json({
        message: "Password Reset Successful, Please Login",
    });



})




module.exports = {
    registerUser,
    loginUser,
    logOut,
    getSingleUser,
    getUser,
    LoginStatus,
    updateUser,
    updatedPassword,
    forgotPassword,
    resetPassword

}