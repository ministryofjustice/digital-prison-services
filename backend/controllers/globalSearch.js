const moment = require('moment')
const shortid = require('shortid')
const log = require('../log')

const offenderIdPattern = /^[A-Za-z][0-9]{4}[A-Za-z]{2}$/

const globalSearchFactory = elite2Api => {
  const searchByOffender = (context, offenderNo, genderFilter, locationFilter) =>
    elite2Api.globalSearch(context, offenderNo, '', '', genderFilter, locationFilter)

  const searchByName = (context, name, genderFilter, locationFilter) => {
    const [lastName, firstName] = name.split(' ')
    return elite2Api.globalSearch(context, '', lastName, firstName || '', genderFilter, locationFilter)
  }

  const globalSearch = async (context, searchText, genderFilter, locationFilter) => {
    log.info(`In globalSearch, searchText=${searchText}`)
    if (!searchText) {
      return []
    }
    const text = searchText
      .replace(/,/g, ' ')
      .replace(/\s\s+/g, ' ')
      .trim()
    const data = await (offenderIdPattern.test(text)
      ? searchByOffender(context, text, genderFilter, locationFilter)
      : searchByName(context, text, genderFilter, locationFilter))
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
      const uiId = shortid.generate()

      return {
        ...offender,
        latestLocation,
        dateOfBirth,
        uiId,
      }
    })
  }
  return { globalSearch }
}
module.exports = { globalSearchFactory }
