const moment = require('moment')
const querystring = require('querystring')
const { serviceUnavailableMessage } = require('../../common-messages')

const { DATE_TIME_FORMAT_SPEC, MOMENT_DAY_OF_THE_WEEK, MOMENT_TIME } = require('../../../src/dateHelpers')
const { getNamesFromString } = require('../../utils')

const templatePath = 'prisonerProfile/prisonerCaseNotes'
const perPage = 20

module.exports = ({ caseNotesApi, prisonerProfileService, paginationService, nunjucks, logError }) => {
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

    try {
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

      const types = caseNoteTypes.map(caseNoteType => ({
        value: caseNoteType.code,
        text: caseNoteType.description,
      }))

      const subTypes = caseNoteTypes
        .map(caseNoteType =>
          caseNoteType.subCodes.map(subCode => ({
            type: caseNoteType.code,
            value: subCode.code,
            text: subCode.description,
          }))
        )
        .reduce((result, subCodes) => result.concat(subCodes), [])

      if (req.xhr) {
        const { typeCode } = req.query
        const filteredSubTypes = subTypes.filter(st => st.type === typeCode)
        return res.send(nunjucks.render(`${templatePath}/partials/subTypesSelect.njk`, { subTypes: filteredSubTypes }))
      }

      const prisonerProfileData = await prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo)

      const caseNoteViewData = caseNotes.content.map(caseNote => {
        const creationDateTime = moment(caseNote.creationDateTime, DATE_TIME_FORMAT_SPEC)

        const day = creationDateTime.format(MOMENT_DAY_OF_THE_WEEK)
        const date = creationDateTime.format('D MMMM YYYY')
        const time = creationDateTime.format(MOMENT_TIME)
        const authorNames = getNamesFromString(caseNote.authorName)

        const amendments = caseNote.amendments.map(amendment => {
          const amendmentCreatedDateTime = moment(amendment.creationDateTime, DATE_TIME_FORMAT_SPEC)
          return {
            day: amendmentCreatedDateTime.format(MOMENT_DAY_OF_THE_WEEK),
            date: amendmentCreatedDateTime.format('D MMMM YYYY'),
            time: amendmentCreatedDateTime.format(MOMENT_TIME),
            authorName: `${authorNames.join(' ')}`,
            text: amendment.additionalNoteText,
          }
        })

        const createdByColumn = {
          day,
          date,
          time,
          authorName: `${authorNames.join(' ')}`,
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

      const selectedSubTypes = subTypes.filter(sub => sub.type === type)

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
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `/prisoner/${offenderNo}/case-notes` })
    }
  }
}
