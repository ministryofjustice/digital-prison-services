const moment = require('moment')
const log = require('../log')

const offenderIdPattern = /^[A-Z][0-9]{4}[A-Z]{2}$/

const globalSearchFactory = elite2Api => {
  const globalSearch = async (context, searchText) => {
    log.info(`In globalSearch, searchText=${searchText}`)
    let offenderNo = ''
    let firstName = ''
    let lastName = ''
    if (!searchText) {
      return []
    }
    const text = searchText.trim()
    if (offenderIdPattern.test(text)) {
      offenderNo = text
    } else {
      const strings = text.split(' ')
      ;[lastName] = strings
      if (strings.length > 1) {
        ;[, firstName] = strings
      }
    }
    const data = await elite2Api.globalSearch(context, offenderNo, lastName, firstName)
    log.info(data, 'globalSearch data received')
    data.forEach(a => {
      if (a.dateOfBirth) {
        a.dateOfBirth = moment(a.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY')
      }
    })
    return data
  }
  return { globalSearch }
}
module.exports = { globalSearchFactory }
