const { User } = require('../db'); // Add this line at the top

const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.user);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Admins only' });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token or user' });
    }
};

module.exports = adminOnly;