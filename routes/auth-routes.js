const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const bcryptSalt = 10;
const passport = require("passport");
const nodemailer = require("nodemailer");

const User = require("../models/user-schema");
const UserCode = require("../util/user-code");

router.get("/signup", (req, res, next) => {
  res.render("auth/authentication", { User: req.user, isSignin: false });
});

router.post("/send-email", async (req, res, next) => {
  let ifUserCameFromSignin =
    req.headers.referer.split("/")[req.headers.referer.split("/").length - 1] ==
    "signin"
      ? true
      : false;
  const password = (await UserCode()).toString();

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  let mailOptions = {
    from: process.env.EMAIL,
    to: req.body.email,
    subject: "Sending Email using Node.js",
    text: `your password is ${password}!`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  const salt = bcrypt.genSaltSync(bcryptSalt);
  const hashPass = bcrypt.hashSync(password, salt);

  await User.findOneAndUpdate(
    { email: req.body.email },
    { password: hashPass },
    {
      new: true,
    }
  );

  setTimeout(
    async () =>
      User.findOneAndUpdate(
        { email: req.body.email },
        { password: null },
        {
          new: true,
        }
      ),
    30000 // change this to 15 mins
  );

  res.render("auth/authentication", {
    Email: req.body.email,
    isSignin: ifUserCameFromSignin,
  });
});

router.post("/signup", async (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const code = await UserCode();
  const throwaway = await UserCode();
  if (email === "" || password === "") {
    res.render("auth/authentication", { isSignin: false });
    return;
  }
  User.findOne({ email: email }, "email", (err, user) => {
    if (user !== null) {
      res.render("auth/authentication", {
        ErrorText: "email is taken",
        Email: email,
        isSignin: false,
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = User({
      email,
      password: hashPass,
      code,
      throwaway,
    });

    newUser.save((err) => {
      if (err) {
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
  res.render("auth/authentication", { User: req.user, isSignin: true });
});

router.post("/signin", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      console.log(info);
      return res.render("auth/authentication", {
        ErrorText: info.message,
        Email: req.body.email,
        isSignin: true,
      });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      await User.findOneAndUpdate(
        { email: user.email },
        { password: null },
        {
          new: true,
        }
      );
      return res.redirect("/reviews");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
