const moment = require('moment');

const switchDateFormat = displayDate => {
  if (displayDate) {
    return moment(displayDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
  }
  return displayDate;
};

module.exports = switchDateFormat;
