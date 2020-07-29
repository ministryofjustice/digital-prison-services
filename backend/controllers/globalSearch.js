const moment = require('moment')
const shortid = require('shortid')
const log = require('../log')
const { isPrisonerIdentifier } = require('../utils')

const globalSearchFactory = (elite2Api, globalSearchApi) => {
  const searchByOffender = (context, offenderNo, gender, location, dateOfBirth) =>
    // offenderNo can be removed once we have fully switched to prisoner offender search instead, i.e. the env variable
    // OFFENDER_SEARCH_API_ENABLED has been removed
    globalSearchApi.globalSearch(context, {
      offenderNo,
      prisonerIdentifier: offenderNo,
      gender,
      location,
      dateOfBirth,
      includeAliases: true,
    })

  const searchByName = (context, name, gender, location, dateOfBirth) => {
    const [lastName, firstName] = name.split(' ')
    return globalSearchApi.globalSearch(context, {
      lastName,
      firstName,
      gender,
      location,
      dateOfBirth,
      includeAliases: true,
    })
  }

  const globalSearch = async (context, searchText, gender, location, dateOfBirth) => {
    log.info(`In globalSearch, searchText=${searchText}`)
    if (!searchText) {
      return []
    }
    const text = searchText
      .replace(/,/g, ' ')
      .replace(/\s\s+/g, ' ')
      .trim()
    const data = await (isPrisonerIdentifier(text)
      ? searchByOffender(context, text, gender, location, dateOfBirth)
      : searchByName(context, text, gender, location, dateOfBirth))
    log.info(data.length, 'globalSearch data received')

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

      const formattedDateOfBirth =
        offender.dateOfBirth && moment(offender.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY')
      const uiId = shortid.generate()

      return {
        ...offender,
        latestLocation,
        dateOfBirth: formattedDateOfBirth,
        uiId,
      }
    })
  }
  return { globalSearch }
}
module.exports = { globalSearchFactory }
