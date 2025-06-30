const express = require('express');
const passport = require('passport');
const router = express.Router();
require('dotenv').config();
const { generateTokenAndRedirect } = require('./controllers/authController');

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: true
  }),
  (req, res) => {
    const userId = req.user
    req.session.userId = userId
    res.redirect(process.env.CLIENT_URL);
  }
);

module.exports = router;