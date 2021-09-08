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
        usernameField: "email",
      },
      (req, email, password, next) => {
        User.findOne(
          {
            email: email.toLowerCase(),
          },
          (err, user) => {
            let userPassword = user.password == null ? "" : user.password;
            console.log({ password, user: user.password });
            if (err) {
              return next(err);
            }
            if (!user) {
              return next(null, false, {
                message: "Incorrect email",
              });
            }
            if (!bcrypt.compareSync(password, userPassword)) {
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
