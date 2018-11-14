const moment = require('moment')
const log = require('../log')

const offenderIdPattern = /^[A-Za-z][0-9]{4}[A-Za-z]{2}$/

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
    const text = searchText.trim().replace(/,/g, '')
    const data = await (offenderIdPattern.test(text) ? searchByOffender(context, text) : searchByName(context, text))
    log.info(data, 'globalSearch data received')

    const offenderOutIds = data
      .filter(offender => offender.latestLocationId === 'OUT')
      .map(offender => offender.offenderNo)

    const offenderMovements =
      (offenderOutIds.length > 0 && (await elite2Api.getLastPrison({ ...context }, offenderOutIds))) || []

    return data.map(offender => {
      const movement = offenderMovements.filter(mv => mv.offenderNo === offender.offenderNo)[0]
      const latestLocation =
        (movement &&
          (movement.movementType === 'REL'
            ? `Outside - released from ${movement.fromAgencyDescription}`
            : `Outside - ${movement.movementTypeDescription}`)) ||
        offender.latestLocation

      const dateOfBirth = offender.dateOfBirth && moment(offender.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY')

      return {
        ...offender,
        latestLocation,
        dateOfBirth,
      }
    })
  }
  return { globalSearch }
}
module.exports = { globalSearchFactory }
