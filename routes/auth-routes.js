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
  let email = req.body.email;
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

  let signinText = `
  Hi ${email.split("@")[0]},

  Your password is: ${password}

  If you do not sign in within 15 minutes the password will reset and you will have to request a new password.

  Best,
  MystView
  
  `;

  let signupText = `
  Hi ${email.split("@")[0]},

  Thank you for signing up! 

  Your password is: ${password}

  If you do not sign in within 15 minutes the password will reset and you will have to request a new password. 

  Best,
  MystView
  `;

  let text = ifUserCameFromSignin ? signinText : signupText;

  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `MystView | ${
      ifUserCameFromSignin ? "Signin" : "Signup"
    } Password`,
    text,
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

  let user = await User.findOne({ email }, "email", async (err, user) => user);

  if (ifUserCameFromSignin || user) {
    await User.findOneAndUpdate(
      { email },
      { password: hashPass, timeThatPasswordIsSet: Date.now() },
      {
        new: true,
      }
    );
  } else {
    return User.findOne({ email }, "email", async (err, user) => {
      const newUser = User({
        email,
        password: hashPass,
        code: await UserCode(),
      });

      newUser.save((err) => {
        if (err) {
          console.log("error: ", err);
          res.render("auth/authentication", { isSignin: false });
        } else {
          return setTimeout(() => {
            res.render("auth/authentication", {
              Email: email,
              isSignin: true,
              PasswordInfo: true,
            });
          }, 2000);
        }
      });
    });
  }

  res.render("auth/authentication", {
    Email: email,
    isSignin: true,
    PasswordInfo: true,
  });
});

router.get("/signin", (req, res, next) => {
  res.render("auth/authentication", {
    User: req.user,
    isSignin: true,
  });
});

router.post("/signin", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    let differenceInMs = Math.abs(
      new Date(Date.now()) - new Date(user.timeThatPasswordIsSet)
    );
    if (err) {
      return next(err);
    }
    if (differenceInMs > 900000) {
      if (!user.signedIn) {
        await User.deleteOne({ email: user.email }, (err) => {
          if (err) {
            console.log("User couldn't be removed");
          } else {
            console.log("User was removed successfully");
          }
        });
        return res.render("auth/authentication", {
          ErrorText: "Took too long to signup.",
          Email: req.body.email,
          isSignin: true,
        });
      }
      await User.findOneAndUpdate(
        { email: user.email },
        { password: null },
        {
          new: true,
        }
      );
      return res.render("auth/authentication", {
        ErrorText: "Password expired",
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
        { password: null, signedIn: true },
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
