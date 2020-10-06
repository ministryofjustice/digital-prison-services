const moment = require('moment')
const shortid = require('shortid')
const log = require('../log')
const { isPrisonerIdentifier } = require('../utils')

const globalSearchFactory = globalSearchApi => {
  const searchByOffender = (context, offenderNo, gender, location, dateOfBirth) =>
    globalSearchApi.globalSearch(context, {
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

    return data.map(offender => {
      const formattedDateOfBirth =
        offender.dateOfBirth && moment(offender.dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY')
      const uiId = shortid.generate()

      return {
        ...offender,
        dateOfBirth: formattedDateOfBirth,
        uiId,
      }
    })
  }
  return { globalSearch }
}
module.exports = { globalSearchFactory }
