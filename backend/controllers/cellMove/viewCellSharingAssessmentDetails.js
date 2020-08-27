const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { putLastNameFirst, hasLength } = require('../../utils')
const { getBackLinkData } = require('./cellMoveUtils')

module.exports = ({ elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params

  try {
    const { firstName, lastName, assignedLivingUnit } = await elite2Api.getDetails(res.locals, offenderNo, true)

    const assessments = await elite2Api.getAssessments(res.locals, { offenderNumbers: [offenderNo], code: 'CSR' })
    const mostRecentAssessment =
      hasLength(assessments) && assessments.sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0]

    return res.render('cellMove/cellSharingRiskAssessmentDetails.njk', {
      prisonerName: putLastNameFirst(firstName, lastName),
      cellLocation: assignedLivingUnit.description,
      location: mostRecentAssessment.assessmentAgencyId || 'Not entered',
      level: mostRecentAssessment.classification,
      date:
        (mostRecentAssessment.approvalDate &&
          moment(mostRecentAssessment.approvalDate, 'YYYY-MM-DD').format('D MMMM YYYY')) ||
        (mostRecentAssessment.assessmentDate &&
          moment(mostRecentAssessment.assessmentDat, 'YYYY-MM-DD').format('D MMMM YYYY')),
      comment: mostRecentAssessment.assessmentComment || 'Not entered',
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
