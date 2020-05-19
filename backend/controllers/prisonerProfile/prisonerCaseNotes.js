const moment = require('moment')

const { serviceUnavailableMessage } = require('../../common-messages')

const {
  DATE_TIME_FORMAT_SPEC,
  DAY_MONTH_YEAR,
  MOMENT_DAY_OF_THE_WEEK,
  MOMENT_TIME,
} = require('../../../src/dateHelpers')

const templatePath = 'prisonerProfile/prisonerCaseNotes'
const perPage = 10

module.exports = ({ caseNotesApi, prisonerProfileService, paginationService, nunjucks, logError }) => async (
  req,
  res
) => {
  const { offenderNo } = req.params

  try {
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

    if (!req.xhr && !req.query.pageOffsetOption)
      return res.redirect(`/prisoner/${offenderNo}/case-notes?pageOffsetOption=0`)

    const { pageOffsetOption, type, subType, fromDate, toDate } = req.query

    const pageNumber = Math.floor(pageOffsetOption / perPage) || 0

    const caseNotes = await caseNotesApi.getCaseNotes(res.locals, offenderNo, {
      pageNumber,
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

    const caseNoteRows = caseNotes.content.map(caseNote => {
      const creationDateTime = moment(caseNote.creationDateTime, DATE_TIME_FORMAT_SPEC)

      const day = creationDateTime.format(MOMENT_DAY_OF_THE_WEEK)
      const date = creationDateTime.format(DAY_MONTH_YEAR)
      const time = creationDateTime.format(MOMENT_TIME)

      const createdByColumn = nunjucks.render(`${templatePath}/partials/createdColumn.njk`, {
        day,
        date,
        time,
        authorName: caseNote.authorName,
      })

      const occurrenceDateTime = moment(caseNote.occurrenceDateTime, DATE_TIME_FORMAT_SPEC)
      const occurrenceDateTimeText = `${occurrenceDateTime.format(DAY_MONTH_YEAR)} - ${occurrenceDateTime.format(
        MOMENT_TIME
      )}`

      const caseNoteDetailColumn = nunjucks.render(`${templatePath}/partials/caseNoteDetailColumn.njk`, {
        occurrenceDateTime: occurrenceDateTimeText,
        typeDescription: caseNote.typeDescription,
        subTypeDescription: caseNote.subTypeDescription,
        text: caseNote.text,
      })

      return [{ html: createdByColumn }, { html: caseNoteDetailColumn }]
    })

    const selectedSubTypes = subTypes.filter(sub => sub.type === type)

    return res.render(`${templatePath}/caseNotes.njk`, {
      prisonerProfileData,
      caseNoteRows,
      types,
      subTypes: selectedSubTypes,
      caseNotesRootUrl: `/prisoner/${offenderNo}/case-notes`,
      pageOffsetOption,
      formValues: {
        type,
        subType,
        fromDate,
        toDate,
      },
      pagination: paginationService.getPagination(caseNotes.totalElements, Number(pageOffsetOption), perPage, fullUrl),
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}/case-notes` })
  }
}
