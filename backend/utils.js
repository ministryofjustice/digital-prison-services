const moment = require('moment')

const switchDateFormat = displayDate => {
  if (displayDate) {
    return moment(displayDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
  }
  return displayDate
}

const distinct = data =>
  data.reduce((accumulator, current) => (accumulator.includes(current) ? accumulator : [...accumulator, current]), [])

const sortByDateTime = (t1, t2) => {
  if (t1 && t2) {
    return moment(t1).valueOf() - moment(t2).valueOf()
  }
  if (t1) return -1
  if (t2) return 1
  return 0
}

const capitalize = string => {
  if (typeof string !== 'string') return ''
  const lowerCase = string.toLowerCase()
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1)
}

const isViewableFlag = code => ['HA', 'XEL'].includes(code)

module.exports = {
  switchDateFormat,
  distinct,
  sortByDateTime,
  capitalize,
  isViewableFlag,
}
