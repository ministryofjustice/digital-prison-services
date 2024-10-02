import { capitalize, formatName, putLastNameFirst } from '../utils'
import { serviceUnavailableMessage } from '../common-messages'
import { getContextWithClientTokenAndRoles } from './prisonerProfile/prisonerProfileContext'
import contextProperties from '../contextProperties'

export default ({ prisonApi, caseNotesApi, logError, systemOauthClient }) => {
  const getOffenderDetails = async (res, offenderNo) => {
    const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)

    return {
      profileUrl: `/prisoner/${offenderNo}`,
      name: putLastNameFirst(firstName, lastName),
    }
  }
  const index = async (req, res) => {
    const { offenderNo, caseNoteId } = req.params

    const { context } = await getContextWithClientTokenAndRoles({
      offenderNo,
      res,
      req,
      oauthApi: null,
      systemOauthClient,
      restrictedPatientApi: null,
    })

    try {
      const prisonerDetails = await prisonApi.getDetails(res.locals, offenderNo)
      if (prisonerDetails.agencyId) {
        contextProperties.setCustomRequestHeaders(context, { CaseloadId: prisonerDetails.agencyId })
      }
      const caseNote = await caseNotesApi.getCaseNote(context, offenderNo, caseNoteId)

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
          caseNote.amendments.map((amendment) => ({
            text: amendment.additionalNoteText,
          })),
        isOmicOpenCaseNote: caseNote.subType === 'OPEN_COMM',
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/case-notes`
      throw error
    }
  }

  const stashStateAndRedirectToAmendCaseNote = (req, res, moreDetail, errors, offenderNo, caseNoteId) => {
    if (errors.length > 0) req.flash('amendmentErrors', errors)
    req.flash('formValues', { moreDetail })
    return res.redirect(`/prisoner/${offenderNo}/case-notes/amend-case-note/${caseNoteId}`)
  }

  const makeAmendment = async (req, res, { offenderNo, caseNoteId, moreDetail }) => {
    const { context } = await getContextWithClientTokenAndRoles({
      offenderNo,
      res,
      req,
      oauthApi: null,
      systemOauthClient,
      restrictedPatientApi: null,
    })

    try {
      await caseNotesApi.amendCaseNote(context, offenderNo, caseNoteId, {
        text: moreDetail,
      })

      return res.redirect(`/prisoner/${offenderNo}/case-notes`)
    } catch (apiError) {
      if (apiError.response && apiError.response.status === 400) {
        const errorData = {
          href: '#moreDetail',
          text: apiError.response.body?.userMessage,
        }
        return stashStateAndRedirectToAmendCaseNote(req, res, moreDetail, [errorData], offenderNo, caseNoteId)
      }
      logError(req.originalUrl, apiError, serviceUnavailableMessage)
      return res.render('error.njk', { url: `/prisoner/${offenderNo}/case-notes` })
    }
  }

  const maximumLengthValidation = {
    href: '#moreDetail',
    text: `Enter more details using 4,000 characters or less`,
  }

  const post = async (req, res) => {
    const { offenderNo, caseNoteId } = req.params
    const { moreDetail, isOmicOpenCaseNote } = req.body

    try {
      const errors = []

      if (!moreDetail) errors.push({ href: '#moreDetail', text: 'Enter more details to case note' })

      if (moreDetail && moreDetail.length > 4000) errors.push(maximumLengthValidation)

      if (errors.length > 0)
        return stashStateAndRedirectToAmendCaseNote(req, res, moreDetail, errors, offenderNo, caseNoteId)

      if (isOmicOpenCaseNote === 'true') {
        req.session.draftCaseNoteDetail = { moreDetail }
        return res.redirect(`/prisoner/${offenderNo}/case-notes/amend-case-note/${caseNoteId}/confirm`)
      }

      return makeAmendment(req, res, { offenderNo, caseNoteId, moreDetail })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/case-notes`
      throw error
    }
  }

  const areYouSure = async (req, res) => {
    const { offenderNo } = req.params
    const offenderDetails = await getOffenderDetails(res, offenderNo)

    return res.render('caseNotes/addCaseNoteConfirm.njk', {
      errors: req.flash('confirmErrors'),
      offenderNo,
      offenderDetails,
      homeUrl: `/prisoner/${offenderNo}/case-notes`,
      breadcrumbText: 'Add more details to case note',
    })
  }

  const confirm = async (req, res) => {
    const { offenderNo, caseNoteId } = req.params
    const { confirmed } = req.body
    if (!confirmed) {
      const errors = [{ href: '#confirmed', text: 'Select yes if this information is appropriate to share' }]
      req.flash('confirmErrors', errors)
      return res.redirect(`/prisoner/${offenderNo}/case-notes/amend-case-note/${caseNoteId}/confirm`)
    }

    const { moreDetail } = req.session.draftCaseNoteDetail
    delete req.session.draftCaseNoteDetail
    if (confirmed === 'Yes') return makeAmendment(req, res, { offenderNo, caseNoteId, moreDetail })
    return stashStateAndRedirectToAmendCaseNote(req, res, moreDetail, [], offenderNo, caseNoteId)
  }

  return { index, post, areYouSure, confirm }
}
