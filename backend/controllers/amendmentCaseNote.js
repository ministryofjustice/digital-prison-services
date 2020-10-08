const { capitalize, formatName, putLastNameFirst } = require('../utils')
const { serviceUnavailableMessage } = require('../common-messages')

module.exports = ({ elite2Api, caseNotesApi, logError }) => {
  const index = async (req, res) => {
    const { offenderNo, caseNoteId } = req.params

    try {
      const [caseNote, prisonerDetails] = await Promise.all([
        caseNotesApi.getCaseNote(res.locals, offenderNo, caseNoteId),
        elite2Api.getDetails(res.locals, offenderNo),
      ])

      const { staffId } = req.session.userDetails

      if (Number(caseNote.authorUserId) !== staffId) {
        return res.render('notFound.njk', { url: req.headers.referer || `/prisoner/${offenderNo}/case-notes` })
      }

      const formValues = req.flash('formValues')

      return res.render('amendCaseNote.njk', {
        errors: req.flash('amendmentErrors'),
        formValues: formValues && formValues.pop(),
        caseNoteId: caseNote.caseNoteId,
        prisonNumber: offenderNo,
        prisonerNameForBreadcrumb: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
        prisonerName: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        typeSubType: `${capitalize(caseNote.typeDescription)}: ${capitalize(caseNote.subTypeDescription)}`,
        caseNoteText: caseNote.text,
        backToCaseNotes: `/prisoner/${offenderNo}/case-notes`,
        postAmendmentUrl: req.originalUrl,
        amendments:
          caseNote.amendments &&
          caseNote.amendments.map(amendment => ({
            text: amendment.additionalNoteText,
          })),
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `/prisoner/${offenderNo}/case-notes` })
    }
  }

  const stashSateAndRedirectToIndex = (req, res, moreDetail, errors) => {
    req.flash('amendmentErrors', errors)
    req.flash('formValues', {
      moreDetail,
    })
    return res.redirect(req.originalUrl)
  }

  const makeAmendment = async (req, res, { offenderNo, caseNoteId, moreDetail, maximumLengthValidation }) => {
    try {
      await caseNotesApi.amendCaseNote(res.locals, offenderNo, caseNoteId, {
        text: moreDetail,
      })

      return res.redirect(`/prisoner/${offenderNo}/case-notes`)
    } catch (apiError) {
      if (apiError.response && apiError.response.status === 400) {
        return stashSateAndRedirectToIndex(req, res, moreDetail, [maximumLengthValidation])
      }
      logError(req.originalUrl, apiError, serviceUnavailableMessage)
      return res.render('error.njk', { url: `/prisoner/${offenderNo}/case-notes` })
    }
  }

  const post = async (req, res) => {
    const { offenderNo, caseNoteId } = req.params
    const { moreDetail } = req.body

    const maximumLengthValidation = {
      href: '#moreDetail',
      text: `Enter more details using 4,000 characters or less`,
    }

    try {
      const errors = []

      if (!moreDetail) errors.push({ href: '#moreDetail', text: 'Enter more details to case note' })

      if (moreDetail && moreDetail.length > 4000) errors.push(maximumLengthValidation)

      if (errors.length > 0) return stashSateAndRedirectToIndex(req, res, moreDetail, errors)

      return makeAmendment(req, res, { offenderNo, caseNoteId, moreDetail, maximumLengthValidation })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `/prisoner/${offenderNo}/case-notes` })
    }
  }

  return {
    index,
    post,
  }
}
