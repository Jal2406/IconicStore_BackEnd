const passport = require('passport-google-oauth20');
const { User } = require('../db');
const GoogleStrat = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrat({
    clientID:'',
    clientSecret:'',
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, function(accessToken, refreshToken, profile, done){
    User.findOne({googleId})
}
))