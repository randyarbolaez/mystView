const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    date: { type: String, required: true },
    review: { type: String, required: true },
    code: { type: String, required: true },
    sentimentScore: { type: Number },
    sentimentReview: { type: String },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
