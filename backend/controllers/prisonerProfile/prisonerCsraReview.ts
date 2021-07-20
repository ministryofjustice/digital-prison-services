// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'putLastNam... Remove this comment to see the full error message
const { putLastNameFirst, formatName, formatTimestampToDate } = require('../../utils')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'notEntered... Remove this comment to see the full error message
const { notEnteredMessage } = require('../../common-messages')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'csraTransl... Remove this comment to see the full error message
const { csraTranslations } = require('../../shared/csraHelpers')

module.exports =
  ({ prisonApi }) =>
  async (req, res, next) => {
    const { offenderNo } = req.params
    const { assessmentSeq, bookingId } = req.query

    try {
      const [prisonerDetails, reviewDetails] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        prisonApi.getCsraReviewForBooking(res.locals, bookingId, assessmentSeq),
      ])

      const {
        assessmentAgencyId,
        assessmentCommitteeName,
        assessorUser,
        classificationCode,
        originalClassificationCode,
      } = reviewDetails

      const agencyDetails = assessmentAgencyId ? await prisonApi.getAgencyDetails(res.locals, assessmentAgencyId) : {}
      const staffDetails = assessorUser ? await prisonApi.getStaffDetails(res.locals, assessorUser) : {}

      const assessorAuthority = assessmentCommitteeName || 'Not entered'
      const assessorName = formatName(staffDetails.firstName, staffDetails.lastName)

      return res.render('prisonerProfile/prisonerCsraReview.njk', {
        breadcrumbPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
        details: [
          {
            key: { text: 'CSRA' },
            value: {
              text: originalClassificationCode
                ? `${csraTranslations[classificationCode]} - this is an override from ${csraTranslations[originalClassificationCode]}`
                : csraTranslations[classificationCode],
            },
          },
          ...(originalClassificationCode
            ? [
                {
                  key: { text: 'Override reason' },
                  value: { text: reviewDetails.classificationReviewReason || notEnteredMessage },
                },
              ]
            : []),
          ...(reviewDetails.approvalCommitteeName
            ? [
                {
                  key: { text: 'Authorised by' },
                  value: { text: reviewDetails.approvalCommitteeName },
                },
              ]
            : []),
          {
            key: { text: 'Location', classes: 'govuk-!-padding-top-6' },
            value: { text: agencyDetails.description || notEnteredMessage },
          },
          {
            key: { text: 'Comments' },
            value: { text: reviewDetails.assessmentComment || notEnteredMessage },
          },
          {
            key: { text: 'Reviewed by' },
            value: { text: `${assessorAuthority} - ${assessorName}` },
          },
          {
            key: { text: 'Next review date' },
            value: { text: formatTimestampToDate(reviewDetails.nextReviewDate, 'DD MMMM YYYY') },
          },
        ],
        profileUrl: `/prisoner/${offenderNo}`,
        reviewDate: formatTimestampToDate(reviewDetails.assessmentDate, 'DD MMMM YYYY'),
        reviewQuestions: reviewDetails.questions?.filter((q) => !!q.answer),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
