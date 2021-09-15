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

  let text = ifUserCameFromSignin ? signinText : `signup ${password}`;

  let mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "MystView Password",
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
  console.log("USER /: ", user);

  if (ifUserCameFromSignin || user) {
    await User.findOneAndUpdate(
      { email },
      { password: hashPass },
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
          setTimeout(async () => {
            await User.findOne({ email: email }, (err, doc) => {
              let isUserSignedIn = doc.signedIn;
              if (!isUserSignedIn) {
                User.deleteOne({ email: email }, (err) => {
                  if (err) {
                    console.log("User couldn't be removed");
                  } else {
                    console.log("User was removed successfully");
                  }
                });
              }
            });
          }, 900000);
          return setTimeout(() => {
            console.log("rediret");
            res.render("auth/authentication", {
              Email: email,
              isSignin: true,
              blah: true,
            });
          }, 2000);
        }
      });
    });
  }

  setTimeout(
    async () =>
      User.findOneAndUpdate(
        { email },
        { password: null },
        {
          new: true,
        }
      ),
    900000 // change this to 15 mins
  );

  res.render("auth/authentication", {
    Email: email,
    isSignin: true,
    blah: true,
  });
});

router.get("/signin", (req, res, next) => {
  res.render("auth/authentication", {
    User: req.user,
    isSignin: true,
  });
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
