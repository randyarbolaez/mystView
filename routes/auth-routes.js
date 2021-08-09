const express = require("express");
const router = express.Router();

const User = require("../models/user-schema");
const UserCode = require("../util/user-code");

const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");

router.get("/signup", (req, res, next) => {
  res.render("auth/authentication", { User: req.user, isSignin: false });
});

router.post("/signup", async (req, res, next) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password;
  // const code = req.body.code;
  const code = await UserCode();
  console.log(code, "CODE AUTH-ROUTES.JS");
  if (username === "" || password === "") {
    // res.render("auth/signup", { isSignin: false });
    res.render("auth/authentication", { isSignin: false });
    return;
  }
  User.findOne({ username: username }, "username", (err, user) => {
    if (user !== null) {
      // res.render("auth/signup", {
      res.render("auth/authentication", {
        ErrorText: "Username is taken",
        Username: username,
        isSignin: false,
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
        // res.render("auth/signup", { isSignin: false });
        res.render("auth/authentication", { isSignin: false });
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
  // res.render("auth/signin", { User: req.user, showSignIn: true });
  res.render("auth/authentication", { User: req.user, isSignin: true });
});

router.post("/signin", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log(info);
      // return res.render("auth/signin", {
      return res.render("auth/authentication", {
        ErrorText: info.message,
        Username: req.body.username,
        isSignin: true,
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
