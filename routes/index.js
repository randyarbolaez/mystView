const express = require("express");
const router = express.Router();

/* GET home page */
router.get("/", (req, res, next) => {
  let reviewCode = "";
  if (req.url.includes("reviewCode")) {
    reviewCode = req.url.split("=")[req.url.split("=").length - 1];
  }
  res.render("index", {
    User: req.user,
    reviewCode: reviewCode.length > 1 ? reviewCode : "",
  });
});

module.exports = router;
