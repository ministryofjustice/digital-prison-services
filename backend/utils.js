const moment = require('moment')

const switchDateFormat = displayDate => {
  if (displayDate) {
    return moment(displayDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  }
  return displayDate
}

const distinct = data =>
  data.reduce((accumulator, current) => (accumulator.includes(current) ? accumulator : [...accumulator, current]), [])

const isToday = formattedDate => moment().format('YYYY-MM-DD') === formattedDate
const sortByDateTime = (t1, t2) => {
  if (t1 && t2) {
    return moment(t1).valueOf() - moment(t2).valueOf()
  }
  if (t1) return -1
  if (t2) return 1
  return 0
}

module.exports = {
  switchDateFormat,
  distinct,
  isToday,
  sortByDateTime,
}
