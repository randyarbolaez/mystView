const User = require("../models/user-schema");

const generateRandomSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getUserCode = async () => {
  let userCode = generateRandomSixDigitCode();
  let result = await User.findOne({ code: userCode }, (err, user) => {
    if (user) {
      return null;
    } else {
      return user;
    }
  });
  if (result == null) {
    return userCode;
  } else {
    getUserCode();
  }
};

module.exports = getUserCode;
