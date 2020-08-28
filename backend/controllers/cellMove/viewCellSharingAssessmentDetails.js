const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst, hasLength } = require('../../utils')
const { getBackLinkData } = require('./cellMoveUtils')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const [offenderDetails, assessments] = await Promise.all([
      elite2Api.getDetails(res.locals, offenderNo, true),
      elite2Api.getCsraAssessments(res.locals, [offenderNo]),
    ])

    const { firstName, lastName, assignedLivingUnit } = offenderDetails || {}

    const mostRecentAssessment =
      hasLength(assessments) && assessments.sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0]

    const location =
      mostRecentAssessment &&
      mostRecentAssessment.assessmentAgencyId &&
      (await elite2Api.getAgencyDetails(res.locals, mostRecentAssessment.assessmentAgencyId))

    return res.render('cellMove/cellSharingRiskAssessmentDetails.njk', {
      prisonerName: putLastNameFirst(firstName, lastName),
      cellLocation: (assignedLivingUnit && assignedLivingUnit.description) || 'Not entered',
      location: (location && location.description) || 'Not entered',
      level: mostRecentAssessment && mostRecentAssessment.classification,
      date:
        (mostRecentAssessment &&
          mostRecentAssessment.assessmentDate &&
          moment(mostRecentAssessment.assessmentDate, 'YYYY-MM-DD').format('D MMMM YYYY')) ||
        'Not entered',
      comment: (mostRecentAssessment && mostRecentAssessment.assessmentComment) || 'Not entered',
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
