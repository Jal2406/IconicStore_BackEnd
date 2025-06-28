const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');
const {User} = require('../db');
const bcrypt = require('bcryptjs');
const adminKey = "admin123"; 
const JWT_SEC = "asd123";


router.post('/', async (req, res)=>{
    const body = req.body;
    const isUser = await User.findOne({
        email: body.email
    })

    if (isUser) {
        return res.json({
            message:'User already exist!!'
        })
    }
    const hashedPassword = await bcrypt.hash(req.body.pass, 10);
    
    const user = await User.create({ email: req.body.email, pass: hashedPassword, 
        fname: req.body.fname, lname: req.body.lname, role: req.body.role });
    req.session.userId = user._id;
    // return res.status(200).json({
    //     message:'User Created',
    //     token,
    //     user: {
    //         role: user.role,
    //         fname: user.fname,
    //     }
    // })
    return res.json({ success: true, redirectUrl: process.env.CLIENT_URL });
})

module.exports = router;