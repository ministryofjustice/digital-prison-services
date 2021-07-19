// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'formatName... Remove this comment to see the full error message
const { formatName, putLastNameFirst } = require('../../utils')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'perPage'.
const perPage = 10

const sortByDateTimeDesc = (left, right) => {
  const leftDateTime = moment(`${left.reportDate}T${left.reportTime}`, 'DD/MM/YYYYTHH:mm')
  const rightDateTime = moment(`${right.reportDate}T${right.reportTime}`, 'DD/MM/YYYYTHH:mm')

  return rightDateTime.valueOf() - leftDateTime.valueOf()
}

const sortByTextAlphabetically = (left, right) => left.text.localeCompare(right.text)

module.exports =
  ({ adjudicationHistoryService, prisonApi, paginationService }) =>
  async (req, res) => {
    const { offenderNo } = req.params
    const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

    const errors = []
    const { fromDate, toDate, agencyId, finding, pageOffsetOption = 0 } = req.query || {}

    const fromDateMoment = fromDate && moment(fromDate, 'DD/MM/YYYY')
    const toDateMoment = toDate && moment(toDate, 'DD/MM/YYYY')

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
            ...{ fromDate: fromDateMoment && fromDateMoment.format('YYYY-MM-DD') },
            ...{ toDate: toDateMoment && toDateMoment.format('YYYY-MM-DD') },
          }

    const adjudicationsData = await adjudicationHistoryService.getAdjudications(
      res.locals,
      offenderNo,
      filterParameters,
      pageOffsetOption,
      perPage
    )

    const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)

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
      rows: adjudicationsData.results.sort(sortByDateTimeDesc).map((result) => [
        {
          html: `<a href="/prisoner/${offenderNo}/adjudications/${result.adjudicationNumber}" class="govuk-link"> ${result.adjudicationNumber} </a>`,
        },
        { text: `${result.reportDate} - ${result.reportTime}` },
        { text: result.establishment },
        { text: result.offenceDescription },
        { text: result.findingDescription },
      ]),
      agencies: adjudicationsData.agencies.map((agency) => ({
        text: agency.description,
        value: agency.agencyId,
      })),
      findingTypes: adjudicationsData.findingTypes
        .map((fd) => ({
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
  }
