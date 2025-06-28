const express = require('express')
const router = express.Router();

const authSession = (req, res, next) => {
    if (req.session && req.session.userId) {
    req.user = req.session.userId;
    // console.log(req.user)
    return next();
  }
  return res.json({ message: 'Unauthorized' });
}

module.exports = {authSession}