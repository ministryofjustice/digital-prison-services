const { putLastNameFirst } = require('../../utils')
const { getBackLinkData } = require('./cellMoveUtils')
const getValueByType = require('../../shared/getValueByType')

module.exports = ({ prisonApi }) => async (req, res) => {
  const { offenderNo } = req.params

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
    } = await prisonApi.getDetails(res.locals, offenderNo, true)
    const mainOffence = await prisonApi.getMainOffence(res.locals, bookingId)
    const { ethnicity, raceCode } = physicalAttributes || {}

    return res.render('cellMove/offenderDetails.njk', {
      prisonerName: putLastNameFirst(firstName, lastName),
      cellLocation: assignedLivingUnit.description || 'Not entered',
      offenderNo,
      age: age || 'Not entered',
      religion: religion || 'Not entered',
      ethnicity: (ethnicity && raceCode && `${ethnicity} (${raceCode})`) || 'Not entered',
      sexualOrientation: getValueByType('SEXO', profileInformation, 'resultValue') || 'Not entered',
      smokerOrVaper: getValueByType('SMOKE', profileInformation, 'resultValue') || 'Not entered',
      mainOffence: (mainOffence && mainOffence[0] && mainOffence[0].offenceDescription) || 'Not entered',
      ...getBackLinkData(req.headers.referer, offenderNo),
      profileUrl: `/prisoner/${offenderNo}`,
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}/cell-move/search-for-cell`
    res.locals.homeUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
