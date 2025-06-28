const express = require('express');
// const authSession = require('../middleware/authSession');
const { User } = require('../db');
const router = express.Router();
const adminOnly = require('../middleware/adminAuth');
const { authSession } = require('../middleware/authSession');

router.get('/users', authSession, adminOnly, async(req, res) => {
    try{
        const buyers = await User.find({ role: 'buyer' });
        res.json(buyers);
    }
    catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

router.delete('/users/:id', authSession, adminOnly, async(req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await User.deleteOne({ _id: userId });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ message: 'Error deleting user' });
    }
})

module.exports = router;