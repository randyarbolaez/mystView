const express = require("express");
const router = express.Router();
const passport = require("passport");
var moment = require("moment");

const User = require("../models/user-schema");
const Review = require("../models/review-schema");

//MAKE SURE USER IS LOGGED IN
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}

//MAKE SURE USER IS LOGGED IN
router.get("/", ensureAuthenticated, (req, res, next) => {
  Review.find({ code: req.user.code }, (err, myReviews) => {
    if (err) {
      return next(err);
    }
    console.log(myReviews, "myReviews");
    res.render("reviews/reviews-index", { Reviews: myReviews });
  });
});

//CREATE ENTRY
router.post("/create", (req, res, next) => {
  const newReview = new Review({
    date: moment().format("dddd, MMMM Do YYYY"),
    review: req.body.review,
    code: req.body.code
  });
  User.find((err, allUsers) => {
    if (err) {
      return next(err);
    }
    let everyCode = allUsers.map(review => {
      return review.code;
    });
    let validCode = everyCode.filter(code => code == newReview.code);

    if (!!validCode.length) {
      newReview.save(err => {
        if (err) {
          return next(err);
        } else {
          res.redirect("/");
        }
      });
    } else {
      res.render("error-code");
    }
  });
});

module.exports = router;
