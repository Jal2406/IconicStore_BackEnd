const jwt = require('jsonwebtoken');


exports.generateTokenAndRedirect = (req, res) => {
  const user = req.user;
  const token = jwt.sign({
    email: user.email,
    name: user.fname + ' ' + user.lname,
    userId: user._id
  }, process.env.JWT_SECRET || 'asd123');

  res.redirect(`https://iconic-store-front-end-x8ys.vercel.app/?token=${token}`);
};