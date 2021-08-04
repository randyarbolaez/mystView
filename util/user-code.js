const User = require("../models/user-schema");

const generateRandomSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getUserCode = async () => {
  // 438192
  //   User.findOne({ code: "438192" }, (err, user) => {
  //     console.log(user);
  //   });
  let result = await User.findOne(
    // { code: generateRandomSixDigitCode() },
    { code: "438192" },
    (err, user) => {
      if (user) {
        return null;
      } else {
        return user;
      }
    }
  );
  //   console.log("generateRandomSixDigitCode", {
  //     userWithCode,
  //     generateRandomSixDigitCode: generateRandomSixDigitCode(),
  //   });
  //   let userWithCode = findUserWithCode.then((user) => {
  //     return user;
  //   });
  //   let userWithCode = await findUserWithCode();
  //   await findUserWithCode();
  return result;
};

module.exports = getUserCode;
