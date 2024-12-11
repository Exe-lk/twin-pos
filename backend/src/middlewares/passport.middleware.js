const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const {
  jwtSecret,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = require("../configs/server");
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

//to access private routes you have to send jwtToken in headers as a bearer token
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
    },
    function (jwtPayload, cb) {
      return User.findById(jwtPayload.user._id)
        .then((user) => {
          return cb(null, user); //pass user object
        })
        .catch((err) => {
          return cb(err);
        });
    }
  )
);

// in sign in you should send email as username
passport.use(
  new LocalStrategy(async function (username, password, done) {
    try {
      const user = await User.findOne({ email: username });
      if (!user) {
        return done(null, false, { email: username });
      }

      bcrypt.compare(password, user.password, function (err, result) {
        if (!result) {
          return done(null, false);
        }
        return done(null, user);
      });
    } catch (err) {
      return done(err);
    }
  })
);
//login with google
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // Find or create a user with the email from the Google profile
        let user = await User.findOne({ email: profile.emails[0].value });
        if (!user) {
          user = new User({
            email: profile.emails[0].value,
            name: profile.displayName,
          });
          await user.save();
        } else if (!user.name) {
          user.name = profile.displayName;
          await user.save();
        }
        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);
