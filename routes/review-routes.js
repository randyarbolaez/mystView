const express = require("express");
const router = express.Router();
const passport = require("passport");
const moment = require("moment");

// sentiment analysis
const Sentiment = require("sentiment");
const sentiment = new Sentiment();
// sentiment analysis

const SentimentAnalysis = require("../util/sentiment-analysis")

console.log('hello',SentimentAnalysis('8248324 stupid sdfjhfsjhf rnady RNAYDYu sfdkjsf438934 !@323&'));

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
    res.render("reviews/reviews-index", { Reviews: myReviews });
  });
});

//CREATE ENTRY
router.post("/create", (req, res, next) => {
  console.log('hello')
  const newReview = new Review({
    date: moment().format("dddd, MMMM Do YYYY"),
    review: req.body.review,
    code: req.body.code,
    sentimentScore: sentiment.analyze(req.body.review).score,
    sentimentReview:
      sentiment.analyze(req.body.review).score > 3
        ? "good"
        : sentiment.analyze(req.body.review).score < 0
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
      res.render("error-code");
    }
  });
});

module.exports = router;
