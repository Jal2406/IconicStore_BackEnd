const express = require('express');
const { User } = require('../db');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SEC = 'asd123';
const bcrypt = require('bcryptjs');
const {authSession} = require('../middleware/authSession')
const authmiddle = require('../middleware/authmiddle');

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               pass:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       403:
 *         description: Invalid password
 *       404:
 *         description: User does not exist
 */

router.post('/',async(req, res) => {
    const user = await User.findOne({
        email:req.body.email
    })

    if (user) {
        const isPasswordValid = await bcrypt.compare(req.body.pass, user.pass)
        if (isPasswordValid) {
            // const token = jwt.sign({userId:user._id}, JWT_SEC)
            req.session.userId = user._id;
            return res.json({ success: true, redirectUrl: process.env.CLIENT_URL});
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
router.get('/profile', authSession, async (req, res) => {
    try {
        const decoded = req.user;
        const user = await User.findById(decoded);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ fname: user.fname, lname: user.lname, email: user.email, role: user.role });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});
router.get('/checkProfile', async (req, res) => {
    try {
        const decoded = req.session.userId;
        // const decoded = req.user;
        const user = await User.findById(decoded);
        if (!user) return res.json({ role: null});
        res.json({ fname: user.fname, lname: user.lname, email: user.email, role: user.role });
    } catch (err) {
        res.json({role:null});
    }
});

router.delete('/', async(req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid')
        res.status(200).json({
            message:"Logged Out"
        })
    })
})


router.put('/profile', authSession, async (req, res) => {
    try {
        const decoded = req.user;
        const { fname, lname, email } = req.body;
        const user = await User.findById(decoded);
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
router.put('/change-password', authSession, async (req, res) => {
    try {
        const decoded = req.user;
        const { oldPass, newPass } = req.body;
        const user = await User.findById(decoded);
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
        const decoded = req.user;
        const user = await User.findById(decoded);
        
        if (!user) return res.json({ message: 'User not found', isAdmin: false });
        
        if (user.role !== 'admin') {
            return res.json({ message: 'Not an admin', isAdmin: false });
        }
        res.json({ isAdmin: true });
    } catch (err) {
        res.json({ 
            message: 'Invalid token',
            isAdmin: false
         });
    }
});



module.exports = router;