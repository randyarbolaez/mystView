const Words = require('./words-and-their-value.js');

const formatString = (str) => (str.match(/[^_\W^\d]+/g).join(' ').toLowerCase().split(' '));

const sentimentAnalysis = (str) => {
  let score = 0;
  let formattedString = formatString(str);

  for(let i = 0;i< formattedString.length;i++){
    if(Words[formattedString[i]] == undefined){
      score += 0;
    }else{
      score += Words[formattedString[i]];
    }
  }
  return score;
};

module.exports = sentimentAnalysis;
