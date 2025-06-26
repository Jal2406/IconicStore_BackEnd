const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.generateTokenAndRedirect = (req, res) => {
  const user = req.user;
  const token = jwt.sign({
    email: user.email,
    name: user.fname + ' ' + user.lname,
    userId: user._id
  }, process.env.JWT_SECRET || 'asd123');

  res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
};