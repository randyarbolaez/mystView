const express = require("express");
const router = express.Router();
const passport = require("passport");
const moment = require("moment");

const SentimentAnalysis = require("../util/sentiment-analysis");

const User = require("../models/user-schema");
const Review = require("../models/review-schema");

//MAKE SURE USER IS LOGGED IN
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/signin");
  }
}

//MAKE SURE USER IS LOGGED IN
router.get("/", ensureAuthenticated, (req, res, next) => {
  Review.find({ code: req.user.code }, (err, myReviews) => {
    if (err) {
      return next(err);
    }
    res.render("reviews/reviews-index", { Reviews: myReviews, User: req.user });
  });
});

//CREATE ENTRY
router.post("/create", (req, res, next) => {
  const newReview = new Review({
    date: moment().format("dddd, MMMM Do YYYY"),
    review: req.body.review,
    code: req.body.code,
    sentimentScore: SentimentAnalysis(req.body.review),
    sentimentReview:
      SentimentAnalysis(req.body.review) >= 6
        ? "good"
        : SentimentAnalysis(req.body.review) < 0
        ? "bad"
        : "neutral",
  });
  User.find((err, allUsers) => {
    if (err) {
      return next(err);
    }
    let everyCode = allUsers.map((review) => {
      return review.code;
    });
    let validCode = everyCode.filter((code) => code == newReview.code);

    if (!!validCode.length) {
      newReview.save((err) => {
        if (err) {
          return next(err);
        } else {
          res.redirect("/");
        }
      });
    } else {
      res.render("index", {
        ErrorText: "Wrong Code",
        Code: newReview.code,
        Review: newReview.review,
      });
    }
  });
});

module.exports = router;
