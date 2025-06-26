const express = require('express');
const passport = require('passport');
const router = express.Router();
const { generateTokenAndRedirect } = require('./controllers/authController');

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:3001/login',
    session: false
  }),
  generateTokenAndRedirect
);

module.exports = router;