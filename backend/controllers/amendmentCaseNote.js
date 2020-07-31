const { capitalize, formatName } = require('../utils')
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

      if (Number(caseNote.authorUserId) !== staffId) return res.redirect('/not-found')

      const formattedName = formatName(prisonerDetails.firstName, prisonerDetails.lastName)

      const prisonerName =
        formattedName && formattedName[formattedName.length - 1] !== 's' ? [formattedName, 's'] : [formattedName]

      const formValues = req.flash('formValues')

      return res.render('amendCaseNote.njk', {
        errors: req.flash('amendmentErrors'),
        formValues: formValues && formValues.pop(),
        caseNoteId: caseNote.caseNoteId,
        prisonNumber: offenderNo,
        prisonerName,
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

  const post = async (req, res) => {
    const { offenderNo, caseNoteId } = req.params
    const { moreDetail } = req.body

    try {
      const errors = []

      if (!moreDetail) {
        errors.push({
          href: '#moreDetail',
          text: 'Enter more details to case note',
        })
      }

      if (moreDetail && moreDetail.length > 4000) {
        errors.push({
          href: '#moreDetail',
          text: `Enter more details using 4000 characters or less`,
        })
      }

      if (errors.length > 0) {
        req.flash('amendmentErrors', errors)
        req.flash('formValues', {
          moreDetail,
        })
        return res.redirect(req.originalUrl)
      }

      await caseNotesApi.amendCaseNote(res.locals, offenderNo, caseNoteId, {
        text: moreDetail,
      })

      return res.redirect(`/prisoner/${offenderNo}/case-notes`)
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
