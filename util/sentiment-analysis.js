const Words = require("./words-and-their-value.js");

/*
  ^ = opposite
  _ = match underscores
  \W = match !alphanumeric, also doesnt match underscores
  0-9 = match only numbers
  + = match one or more characters (no empty strings)
*/

const formatString = (str) =>
  str
    .match(/[^_\W0-9]+/g)
    .join(" ")
    .toLowerCase()
    .split(" ");

const sentimentAnalysis = (str) => {
  let score = 0;
  let formattedString = formatString(str);
  for (let i = 0; i < formattedString.length; i++) {
    if (!Words[formattedString[i]]) {
      score += 0;
    } else {
      score += Words[formattedString[i]];
    }
  }
  return score;
};

module.exports = sentimentAnalysis;
