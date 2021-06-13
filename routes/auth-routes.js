const express = require("express");
const router = express.Router();

const User = require("../models/user-schema");

const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");

router.get("/signup", (req, res, next) => {
  res.render("auth/signup", { User: req.user });
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password;
  const code = req.body.code;
  if (username === "" || password === "") {
    res.render("auth/signup");
    return;
  }
  User.findOne({ username: username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", {
        ErrorText: "Username is taken",
        Username: username,
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = User({
      username,
      password: hashPass,
      code,
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup");
      } else {
        req.logIn(newUser, (err) => {
          if (err) {
            return next(err);
          }
          return res.redirect("/reviews");
        });
      }
    });
  });
});

router.get("/signin", (req, res, next) => {
  res.render("auth/signin", { User: req.user });
});

// router.post(
//   "/signin",
//   passport.authenticate("local", {
//     successRedirect: "/reviews",
//     failureRedirect: "/signin",
//     failureFlash: false,
//     passReqToCallback: false,
//   })
// );

router.post("/signin", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log(info);
      return res.render("auth/signin", {
        ErrorText: info.message,
        Username: req.body.username,
      });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/reviews");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
