const passport = require('passport');
const { User } = require('../db');
const GoogleStrat = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrat({
    clientID:'294359618394-f055bq3kmntmmgrh5mr5leguskkeuumt.apps.googleusercontent.com',
    clientSecret:'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',
    callbackURL: 'https://iconicstore-backend.onrender.com/auth/google/callback'
}, async function(accessToken, refreshToken, profile, done){

    try {
        let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
    
      
      user = await User.create({
        googleId: profile.id,
        fname: profile.displayName,
        email: profile.emails[0].value,
        pass: null
      });
    } else if (!user.googleId) {
      
      user.googleId = profile.id;
      await user.save();
    }

    return done(null, user);
  } catch (error) {
        return done(error, null)
    }
}
))