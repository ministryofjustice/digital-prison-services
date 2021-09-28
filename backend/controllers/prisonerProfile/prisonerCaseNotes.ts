import moment from 'moment'
import querystring from 'querystring'
import { DATE_TIME_FORMAT_SPEC, MOMENT_DAY_OF_THE_WEEK, MOMENT_TIME } from '../../../common/dateHelpers'
import { getNamesFromString } from '../../utils'

const templatePath = 'prisonerProfile/prisonerCaseNotes'
const perPage = 20
const SECURE_CASE_NOTE_SOURCE = 'OCNS'

export default ({ caseNotesApi, prisonerProfileService, paginationService, nunjucks, oauthApi }) => {
  const getTotalResults = async (locals, offenderNo, { type, subType, fromDate, toDate }) => {
    const { totalElements } = await caseNotesApi.getCaseNotes(locals, offenderNo, {
      pageNumber: 0,
      perPage: 1,
      type,
      subType,
      startDate: fromDate,
      endDate: toDate,
    })

    return totalElements
  }

  return async (req, res) => {
    const { offenderNo } = req.params

    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

    const { pageOffsetOption, showAll, type, subType, fromDate, toDate } = req.query

    const pageNumber = Math.floor((pageOffsetOption || 0) / perPage) || 0

    const caseNotes = await caseNotesApi.getCaseNotes(res.locals, offenderNo, {
      pageNumber: showAll ? 0 : pageNumber,
      perPage: showAll ? await getTotalResults(res.locals, offenderNo, { type, subType, fromDate, toDate }) : perPage,
      type,
      subType,
      startDate: fromDate,
      endDate: toDate,
    })

    const caseNoteTypes = await caseNotesApi.getCaseNoteTypes(res.locals)

    const types = caseNoteTypes.map((caseNoteType) => ({
      value: caseNoteType.code,
      text: caseNoteType.description,
    }))

    const subTypes = caseNoteTypes
      .map((caseNoteType) =>
        caseNoteType.subCodes.map((subCode) => ({
          type: caseNoteType.code,
          value: subCode.code,
          text: subCode.description,
        }))
      )
      .reduce((result, subCodes) => result.concat(subCodes), [])

    if (req.xhr) {
      const { typeCode } = req.query
      const filteredSubTypes = subTypes.filter((st) => st.type === typeCode)
      return res.send(nunjucks.render(`${templatePath}/partials/subTypesSelect.njk`, { subTypes: filteredSubTypes }))
    }

    const prisonerProfileData = await prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo)

    const userRoles = await oauthApi.userRoles(res.locals).then((roles) => roles.map((role) => role.roleCode))
    const hasDeleteRole = userRoles.includes('DELETE_SENSITIVE_CASE_NOTES')

    const caseNoteViewData = caseNotes.content.map((caseNote) => {
      const creationDateTime = moment(caseNote.creationDateTime, DATE_TIME_FORMAT_SPEC)

      const day = creationDateTime.format(MOMENT_DAY_OF_THE_WEEK)
      const date = creationDateTime.format('D MMMM YYYY')
      const time = creationDateTime.format(MOMENT_TIME)
      const canDelete = hasDeleteRole && caseNote.source === SECURE_CASE_NOTE_SOURCE

      const amendments = caseNote.amendments.map((amendment) => {
        const amendmentCreatedDateTime = moment(amendment.creationDateTime, DATE_TIME_FORMAT_SPEC)
        return {
          day: amendmentCreatedDateTime.format(MOMENT_DAY_OF_THE_WEEK),
          date: amendmentCreatedDateTime.format('D MMMM YYYY'),
          time: amendmentCreatedDateTime.format(MOMENT_TIME),
          authorName: getNamesFromString(amendment.authorName).join(' '),
          text: amendment.additionalNoteText,
          deleteLink:
            canDelete &&
            `/prisoner/${offenderNo}/case-notes/delete-case-note/${caseNote.caseNoteId}/${amendment.caseNoteAmendmentId}`,
        }
      })

      const createdByColumn = {
        day,
        date,
        time,
        authorName: getNamesFromString(caseNote.authorName).join(' '),
      }

      const occurrenceDateTime = moment(caseNote.occurrenceDateTime, DATE_TIME_FORMAT_SPEC)
      const occurrenceDateTimeText = `${occurrenceDateTime.format('dddd D MMMM YYYY')} - ${occurrenceDateTime.format(
        MOMENT_TIME
      )}`

      const canAmend = prisonerProfileData.staffId && prisonerProfileData.staffId.toString() === caseNote.authorUserId
      const showPrintIncentiveLink = ['IEP_WARN', 'IEP_ENC'].includes(caseNote.subType)
      const caseNoteDetailColumn = {
        amendments,
        occurrenceDateTime: occurrenceDateTimeText,
        typeDescription: caseNote.typeDescription,
        subTypeDescription: caseNote.subTypeDescription,
        text: caseNote.text,
        amendLink: canAmend && `/prisoner/${offenderNo}/case-notes/amend-case-note/${caseNote.caseNoteId}`,
        deleteLink: canDelete && `/prisoner/${offenderNo}/case-notes/delete-case-note/${caseNote.caseNoteId}`,
        printIncentiveLink:
          showPrintIncentiveLink &&
          `/iep-slip?offenderNo=${offenderNo}&offenderName=${encodeURIComponent(
            prisonerProfileData.offenderName
          )}&location=${encodeURIComponent(prisonerProfileData.location)}&casenoteId=${
            caseNote.caseNoteId
          }&issuedBy=${encodeURIComponent(prisonerProfileData.staffName)}`,
      }

      return { createdByColumn, caseNoteDetailColumn }
    })

    const selectedSubTypes = subTypes.filter((sub) => sub.type === type)

    return res.render(`${templatePath}/caseNotes.njk`, {
      prisonerProfileData,
      caseNoteViewData,
      types,
      subTypes: selectedSubTypes,
      caseNotesRootUrl: `/prisoner/${offenderNo}/case-notes`,
      viewAllCaseNotesUrl: `/prisoner/${offenderNo}/case-notes?${querystring.stringify({
        showAll: true,
        ...req.query,
      })}`,
      showAll,
      formValues: {
        type,
        subType,
        fromDate,
        toDate,
      },
      pagination: showAll
        ? paginationService.getPagination(caseNotes.totalElements, 0, caseNotes.totalElements, fullUrl)
        : paginationService.getPagination(caseNotes.totalElements, Number(pageOffsetOption || 0), perPage, fullUrl),
    })
  }
}
