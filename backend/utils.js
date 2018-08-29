const moment = require('moment');

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
  distinct
};
