const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst } = require('../../utils')
const getValueByType = require('../../shared/getValueByType')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const backLink = req.headers.referer || `/prisoner/${offenderNo}/select-location`
  const backLinkText = backLink.includes('select-location')
    ? 'Return to select a location'
    : 'Return to select an available cell'

  try {
    const {
      bookingId,
      firstName,
      lastName,
      age,
      religion,
      profileInformation,
      physicalAttributes,
      assignedLivingUnit,
    } = await elite2Api.getDetails(res.locals, offenderNo, true)
    const mainOffence = await elite2Api.getMainOffence(res.locals, bookingId)
    const { ethnicity, raceCode } = physicalAttributes || {}

    return res.render('cellMove/offenderDetails.njk', {
      prisonerName: putLastNameFirst(firstName, lastName),
      cellLocation: assignedLivingUnit.description,
      offenderNo,
      age,
      religion,
      ethnicity: ethnicity && raceCode && `${ethnicity} (${raceCode})`,
      sexualOrientation: getValueByType('SEXO', profileInformation, 'resultValue'),
      smokerOrVaper: getValueByType('SMOKE', profileInformation, 'resultValue'),
      mainOffence: mainOffence && mainOffence[0] && mainOffence[0].offenceDescription,
      backLink,
      backLinkText,
      profileUrl: `/prisoner/${offenderNo}`,
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
