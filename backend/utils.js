
const moment = require('moment');

const switchDateFormat = req => {
  const displayDate = req.query.date;
  if (displayDate) {
    req.query.date = moment(displayDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
  }
};

module.exports = switchDateFormat;
