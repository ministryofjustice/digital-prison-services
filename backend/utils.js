const moment = require('moment');

//https://stackoverflow.com/questions/4340227/sort-mixed-alpha-numeric-array
var reA = /[^a-zA-Z]/g;
var reN = /[^0-9]/g;

function sortAlphaNum (aa, bb) {
  const a = (aa || "");
  const b = (bb || "");

  const aAlpha = a.replace(reA, "");
  const bAlpha = b.replace(reA, "");

  if (aAlpha === bAlpha) {
    const aNumber = parseInt(a.replace(reN, ""), 10);
    const bNumber = parseInt(b.replace(reN, ""), 10);
    return aNumber === bNumber ? 0 : aNumber > bNumber ? 1 : -1; // eslint-disable-line no-nested-ternary
  } else {
    return aAlpha > bAlpha ? 1 : -1;
  }
}

const switchDateFormat = displayDate => {
  if (displayDate) {
    return moment(displayDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
  }
  return displayDate;
};

const distinct = (data) => data.reduce((accumulator, current) =>
  accumulator.includes(current) ? accumulator : [...accumulator, current], []);

module.exports = {
  switchDateFormat,
  distinct,
  sortAlphaNum
};
