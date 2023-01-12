const asyncHandler = require("express-async-handler");

const User = require('../models/user')
const sendEmail = require("../utils/sendEmail");

const getContract = asyncHandler(async (req, res) => {

    const { subject, message } = req.body;

    const user = await User.findById(req.user._id)

    if (!user) {
        res.status(401)
        throw new Error('user not found')
    }

    const sent_to = process.env.EMAIL_USER
    const sent_from = user.email

    try {
        await sendEmail(subject, message, sent_to, sent_from)
        res.status(200).json({ status: 'success', message: "message sent" })
    } catch (err) {
        res.status(401).json({ status: 'fail', message: "message sent failed" })

    }



})


module.exports = {
    getContract
}
