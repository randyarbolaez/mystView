const express = require("express");
const router = express.Router();

const User = require("../models/user-schema");

const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");

router.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const code = req.body.code;
  if (username === "" || password === "") {
    res.render("auth/signup");
    return;
  }
  User.findOne({ username: username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup");
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = User({
      username,
      password: hashPass,
      code
    });

    newUser.save(err => {
      if (err) {
        res.render("auth/signup");
      } else {
        res.redirect("/login");
      }
    });
  });
});

router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/reviews",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: false
  })
);

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
