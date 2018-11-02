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

    const offenderOut = data.filter(offender => offender.latestLocationId === 'OUT')

    /* decorate any 'OUT' prisoners with further information */
    if (offenderOut.length > 0) {
      const offenderNoList = offenderOut.map(offender => offender.offenderNo)
      const prisons = await elite2Api.getLastPrison({ ...context }, offenderNoList)

      offenderOut.forEach(o => {
        const element = prisons.find(p => p.offenderNo === o.offenderNo)
        if (element.movementType === 'REL') {
          o.latestLocation = `Outside - released from ${element.fromAgencyDescription}`
        } else {
          o.latestLocation = `Outside - ${element.movementTypeDescription}`
        }
      })
    }

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
