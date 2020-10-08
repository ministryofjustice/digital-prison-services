const moment = require('moment')

const { DATE_TIME_FORMAT_SPEC } = require('../../../src/dateHelpers')
const { formatName, putLastNameFirst } = require('../../utils')

const perPage = 10

const sortByDateTimeDesc = (left, right) => {
  const leftDateTime = moment(`${left.reportDate}T${left.reportTime}`, DATE_TIME_FORMAT_SPEC)
  const rightDateTime = moment(`${right.reportDate}T${right.reportTime}`, DATE_TIME_FORMAT_SPEC)

  if (leftDateTime.isBefore(rightDateTime, 'day')) return 1
  if (leftDateTime.isAfter(rightDateTime, 'day')) return -1
  return 0
}

const sortByTextAlphabetically = (left, right) => left.text.localeCompare(right.text)

module.exports = ({ adjudicationHistoryService, elite2Api, logError, paginationService }) => async (req, res) => {
  const { offenderNo } = req.params
  const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

  try {
    const errors = []
    const { fromDate, toDate, agencyId, finding, pageOffsetOption = 0 } = req.query || {}

    const fromDateMoment = moment(fromDate, 'DD/MM/YYYY')
    const toDateMoment = moment(toDate, 'DD/MM/YYYY')

    if (fromDate && toDate && fromDateMoment.isAfter(toDateMoment, 'day')) {
      errors.push({ href: '#fromDate', text: 'Enter a from date which is not after the to date' })
      errors.push({ href: '#toDate', text: 'Enter a to date which is not before the from date' })
    }

    const filterParameters =
      errors.length || (!toDate && !fromDate)
        ? { agencyId, finding }
        : {
            agencyId,
            finding,
            fromDate: fromDateMoment.format('YYYY-MM-DD'),
            toDate: toDateMoment.format('YYYY-MM-DD'),
          }

    const adjudicationsData = await adjudicationHistoryService.getAdjudications(
      res.locals,
      offenderNo,
      filterParameters,
      pageOffsetOption,
      perPage
    )

    const { firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

    const prisonerName = formatName(firstName, lastName)

    const noAdjudications = Boolean(!adjudicationsData.results.length)
    const noAdjudicationsSelection = Boolean(noAdjudications && (fromDate || toDate || agencyId || finding))

    return res.render('prisonerProfile/adjudicationHistory.njk', {
      errors,
      prisonerNameForBreadcrumb: putLastNameFirst(firstName, lastName),
      prisonerName,
      prisonerProfileLink: `/prisoner/${offenderNo}/`,
      clearLink: `/offenders/${offenderNo}/adjudications`,
      noAdjudicationsSelection,
      noRecordsFoundMessage:
        (noAdjudications &&
          (noAdjudicationsSelection
            ? 'There are no adjudications for the selections you have made'
            : `${prisonerName} has had no adjudications`)) ||
        null,
      rows: adjudicationsData.results.sort(sortByDateTimeDesc).map(result => [
        {
          html: `<a href="/prisoner/${offenderNo}/adjudications/${result.adjudicationNumber}" class="govuk-link"> ${
            result.adjudicationNumber
          } </a>`,
        },
        { text: `${result.reportDate} ${result.reportTime}` },
        { text: result.establishment },
        { text: result.offenceDescription },
        { text: result.findingDescription },
      ]),
      agencies: adjudicationsData.agencies.map(agency => ({
        text: agency.description,
        value: agency.agencyId,
      })),
      findingTypes: adjudicationsData.findingTypes
        .map(fd => ({
          text: fd.description,
          value: fd.code,
        }))
        .sort(sortByTextAlphabetically),
      formValues: req.query,
      pagination: paginationService.getPagination(
        Number(adjudicationsData.pagination.totalRecords),
        Number(adjudicationsData.pagination.pageOffset),
        perPage,
        fullUrl
      ),
    })
  } catch (error) {
    if (error) logError(req.originalUrl, error, `Failed to load adjudication history page`)

    return res.render('error.njk', {
      url: `/offenders/${offenderNo}/adjudications`,
      homeUrl: `/prisoner/${offenderNo}`,
    })
  }
}
