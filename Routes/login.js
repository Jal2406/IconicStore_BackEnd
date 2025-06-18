const express = require('express');
const { User } = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SEC = 'asd123';
const bcrypt = require('bcryptjs')

router.post('/',async(req, res) => {
    const user = await User.findOne({
        email:req.body.email
    })

    if (user) {
        const isPasswordValid = await bcrypt.compare(req.body.pass, user.pass)
        if (isPasswordValid) {
            const token = jwt.sign({userId:user._id}, JWT_SEC)
            return res.json({
                token,
                message: "Login successful",
                user: {
                    role: user.role,
                    fname: user.fname,
                    }
            })
        }
        else{
            return res.status(403).json({
                message:"Invalid password"
            })
        }
    }
    else{
        return res.status(404).json({
            message:"User do not exist!"
        })
    }
})

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: 'No token' });
        const decoded = jwt.verify(token, JWT_SEC);
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ fname: user.fname, lname: user.lname, email: user.email });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Update user profile (except password)
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: 'No token' });
        const decoded = jwt.verify(token, JWT_SEC);
        const { fname, lname, email } = req.body;
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.fname = fname;
        user.lname = lname;
        user.email = email;
        await user.save();
        res.json({ message: 'Profile updated' });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Change password
router.put('/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: 'No token' });
        const decoded = jwt.verify(token, JWT_SEC);
        const { oldPass, newPass } = req.body;
        const user = await User.findById(decoded.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const isPasswordValid = await bcrypt.compare(oldPass, user.pass);
        if (!isPasswordValid) return res.status(400).json({ message: 'Old password is incorrect' });
        user.pass = await bcrypt.hash(newPass, 10);
        await user.save();
        res.json({ message: 'Password updated' });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Add this new route to verify admin status
router.get('/verify-admin', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ message: 'No token' });
        
        const decoded = jwt.verify(token, JWT_SEC);
        const user = await User.findById(decoded.userId);
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Not an admin', isAdmin: false });
        }
        
        res.json({ isAdmin: true });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});
module.exports = router;