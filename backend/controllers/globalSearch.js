const moment = require('moment')
const log = require('../log')

const offenderIdPattern = /^[A-Z][0-9]{4}[A-Z]{2}$/

const globalSearchFactory = elite2Api => {
  const searchByOffender = (context, offenderNo) => elite2Api.globalSearch(context, offenderNo, '', '')

  const searchByName = (context, name) => {
    const [lastName, firstName] = name.split(' ')
    return elite2Api.globalSearch(context, '', lastName, firstName || '')
  }

  const globalSearch = async (context, searchText) => {
    log.info(`In globalSearch, searchText=${searchText}`)
    if (!searchText) {
      return []
    }
    const text = searchText.trim()
    const data = await (offenderIdPattern.test(text) ? searchByOffender(context, text) : searchByName(context, text))
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
