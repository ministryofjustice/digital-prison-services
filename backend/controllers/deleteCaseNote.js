const { capitalize, formatName, putLastNameFirst } = require('../utils')
const { serviceUnavailableMessage } = require('../common-messages')

module.exports = ({ prisonApi, caseNotesApi, oauthApi, logError }) => {
  const index = async (req, res) => {
    const { offenderNo, caseNoteId, caseNoteAmendmentId } = req.params

    try {
      const [caseNote, prisonerDetails] = await Promise.all([
        caseNotesApi.getCaseNote(res.locals, offenderNo, caseNoteId),
        prisonApi.getDetails(res.locals, offenderNo),
      ])

      const userRoles = await oauthApi.userRoles(res.locals).then(roles => roles.map(role => role.roleCode))

      if (!userRoles.includes('DELETE_SENSITIVE_CASE_NOTES' || !caseNote.caseNoteId)) {
        return res.render('notFound.njk', { url: req.headers.referer || `/prisoner/${offenderNo}/case-notes` })
      }

      let caseNoteData = {
        prisonNumber: offenderNo,
        prisonerNameForBreadcrumb: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
        prisonerName: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        typeSubType: `${capitalize(caseNote.typeDescription)}: ${capitalize(caseNote.subTypeDescription)}`,
        backToCaseNotes: `/prisoner/${offenderNo}/case-notes`,
        caseNoteId: caseNote.caseNoteId,
      }

      if (caseNoteAmendmentId) {
        const amendmentToDelete =
          caseNote.amendments &&
          caseNote.amendments.find(amendment => amendment.caseNoteAmendmentId === Number(caseNoteAmendmentId))

        if (!amendmentToDelete) {
          return res.render('notFound.njk', { url: req.headers.referer || `/prisoner/${offenderNo}/case-notes` })
        }

        caseNoteData = {
          ...caseNoteData,
          caseNoteAmendmentId: amendmentToDelete.caseNoteAmendmentId,
          text: amendmentToDelete.additionalNoteText,
          date: amendmentToDelete.creationDateTime,
          authorName: amendmentToDelete.authorName,
        }
      } else {
        caseNoteData = {
          ...caseNoteData,
          text: caseNote.text,
          date: caseNote.creationDateTime,
          authorName: caseNote.authorName,
          amendments:
            caseNote.amendments &&
            caseNote.amendments.map(amendment => ({
              text: amendment.additionalNoteText,
              date: amendment.creationDateTime,
              authorName: amendment.authorName,
            })),
        }
      }

      return res.render('caseNoteDeleteConfirm.njk', caseNoteData)
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `/prisoner/${offenderNo}/case-notes` })
    }
  }

  const post = async (req, res) => {
    const { offenderNo, caseNoteId, caseNoteAmendmentId } = req.params
    try {
      if (caseNoteAmendmentId) {
        await caseNotesApi.deleteCaseNoteAmendment(res.locals, offenderNo, caseNoteAmendmentId)
      } else {
        await caseNotesApi.deleteCaseNote(res.locals, offenderNo, caseNoteId)
      }
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
