const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user-schema");

module.exports = function (passport) {
  // PASSPORT CONFIG
  passport.serializeUser((user, cb) => {
    cb(null, user._id);
  });

  passport.deserializeUser((id, cb) => {
    User.findById(id, (err, user) => {
      if (err) {
        return cb(err);
      }
      cb(null, user);
    });
  });

  passport.use(
    new LocalStrategy(
      {
        passReqToCallback: true,
      },
      (req, username, password, next) => {
        User.findOne(
          {
            username: username.toLowerCase(),
          },
          (err, user) => {
            if (err) {
              return next(err);
            }
            if (!user) {
              return next(null, false, {
                message: "Incorrect username",
              });
            }
            if (!bcrypt.compareSync(password, user.password)) {
              return next(null, false, {
                message: "Incorrect password",
              });
            }

            return next(null, user);
          }
        );
      }
    )
  );
};
