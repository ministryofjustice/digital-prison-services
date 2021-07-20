// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'putLastNam... Remove this comment to see the full error message
const { putLastNameFirst, hasLength } = require('../../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getBackLin... Remove this comment to see the full error message
const { getBackLinkData } = require('./cellMoveUtils')

module.exports =
  ({ prisonApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    try {
      const [offenderDetails, assessments] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo, true),
        prisonApi.getCsraAssessments(res.locals, [offenderNo]),
      ])

      const { firstName, lastName, assignedLivingUnit } = offenderDetails || {}

      const mostRecentAssessment =
        hasLength(assessments) && assessments.sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0]

      const location =
        mostRecentAssessment &&
        mostRecentAssessment.assessmentAgencyId &&
        (await prisonApi.getAgencyDetails(res.locals, mostRecentAssessment.assessmentAgencyId))

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
      res.locals.redirectUrl = `/prisoner/${offenderNo}/cell-move/search-for-cell`
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
