import { capitalize, formatName, putLastNameFirst } from '../utils'
import { getContextWithClientTokenAndRoles } from './prisonerProfile/prisonerProfileContext'
import contextProperties from '../contextProperties'

export default ({ prisonApi, caseNotesApi, oauthApi, systemOauthClient }) => {
  type CaseNoteData = {
    prisonNumber: string
    prisonerNameForBreadcrumb: string
    prisonerName: string
    typeSubType: string
    backToCaseNotes: string
    caseNoteId: string
    caseNoteAmendmentId?: number
    text?: string
    date?: string
    authorName?: string
    amendments?: Record<string, unknown>[]
  }

  const index = async (req, res) => {
    const { offenderNo, caseNoteId, caseNoteAmendmentId } = req.params

    try {
      const { context } = await getContextWithClientTokenAndRoles({
        offenderNo,
        res,
        req,
        oauthApi,
        systemOauthClient,
        restrictedPatientApi: null,
      })

      const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo)
      if (prisonerDetails?.agencyId) {
        contextProperties.setCustomRequestHeaders(context, { CaseloadId: prisonerDetails.agencyId })
      }
      const caseNote = await caseNotesApi.getCaseNote(context, offenderNo, caseNoteId)

      const userRoles = oauthApi.userRoles(res.locals).map((role) => role.roleCode)

      // @ts-expect-error: This kind of expression is always truthy.
      if (!userRoles.includes('DELETE_SENSITIVE_CASE_NOTES' || !caseNote.caseNoteId)) {
        return res.render('notFound.njk', { url: req.headers.referer || `/prisoner/${offenderNo}/case-notes` })
      }

      let caseNoteData: CaseNoteData = {
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
          caseNote.amendments.find((amendment) => amendment.caseNoteAmendmentId === Number(caseNoteAmendmentId))

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
            caseNote.amendments.map((amendment) => ({
              text: amendment.additionalNoteText,
              date: amendment.creationDateTime,
              authorName: amendment.authorName,
            })),
        }
      }

      return res.render('caseNoteDeleteConfirm.njk', caseNoteData)
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/case-notes`
      throw error
    }
  }

  const post = async (req, res) => {
    const { offenderNo, caseNoteId, caseNoteAmendmentId } = req.params

    const { context } = await getContextWithClientTokenAndRoles({
      offenderNo,
      res,
      req,
      oauthApi,
      systemOauthClient,
      restrictedPatientApi: null,
    })

    try {
      if (caseNoteAmendmentId) {
        await caseNotesApi.deleteCaseNoteAmendment(context, offenderNo, caseNoteAmendmentId)
      } else {
        await caseNotesApi.deleteCaseNote(context, offenderNo, caseNoteId)
      }
      return res.redirect(`/prisoner/${offenderNo}/case-notes`)
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/case-notes`
      throw error
    }
  }

  return {
    index,
    post,
  }
}
