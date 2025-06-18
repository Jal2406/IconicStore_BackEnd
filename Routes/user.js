const express = require('express');
const { User } = require('../db');
const router = express.Router();
const authmiddle = require('../middleware/authmiddle');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const JWT_SEC = 'asd123';
const jwt = require('jsonwebtoken');

const transpot = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mayanijal@gmail.com',
        pass: 'hquh oyak fmgl nlwt'
}
})

    async function sendVerificationEmail(email, otp) {
       const mailOptions = {
         from: 'mayanijal@gmail.com',
         to: email,
         subject: 'OTP Verification',
         html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
       };

       try {
         await transpot.sendMail(mailOptions);
         console.log('Verification email sent successfully');
       } catch (error) {
         console.error('Error sending verification email:', error);
         throw error;
       }
    }

router.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000); 
        user.otp = otp;
        await user.save();
        await sendVerificationEmail(email, otp);
        res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {

    }
})


router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }
    try {
        const user = await User.findOne({ email, otp });
        if (!user) {
            return res.status(404).json({ message: 'Invalid OTP or email' });
        }
        user.otp = null;
        await user.save();
        const resetToken = await jwt.sign({ email: user.email }, JWT_SEC);
        user.token = resetToken;
        await user.save();
        res.status(200).json({ 
            message: 'OTP verified successfully',
            token: resetToken 
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})


router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token and new password are required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SEC);
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);
        user.pass = hashedPassword; 
        user.token = null; 
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;