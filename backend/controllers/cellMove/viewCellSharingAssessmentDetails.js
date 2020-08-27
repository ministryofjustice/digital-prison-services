const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst, hasLength } = require('../../utils')
const { getBackLinkData } = require('./cellMoveUtils')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const { firstName, lastName, assignedLivingUnit, assessments } = await elite2Api.getDetails(
      res.locals,
      offenderNo,
      true
    )
    const mostRecentAssessment =
      hasLength(assessments) &&
      assessments
        .filter(assessment => assessment.assessmentDescription.includes('CSR'))
        .sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0]

    return res.render('cellMove/offenderDetails.njk', {
      prisonerName: putLastNameFirst(firstName, lastName),
      cellLocation: assignedLivingUnit.description,
      assessmentLocation: mostRecentAssessment.assessmentAgencyId,
      offenderNo,
      ...getBackLinkData(req.headers.referer, offenderNo),
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)

    return res.render('error.njk', {
      url: `/prisoner/${offenderNo}/cell-move/select-location`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
