const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { hasLength, formatName, putLastNameFirst, sortByDateTime } = require('../../utils')
const generatePagination = require('../../shared/generatePagination')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ elite2Api, logError, pageSize = 20 }) => async (req, res) => {
  const { offenderNo } = req.params
  const { visitType, fromDate, toDate, page = 0 } = req.query
  const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

  try {
    const [details, visitTypes] = await Promise.all([
      elite2Api.getDetails(res.locals, offenderNo),
      elite2Api.getVisitTypes(res.locals),
    ])
      .then(data => data)
      .catch(error => {
        logError(req.originalUrl, error, serviceUnavailableMessage)
        return res.render('error.njk', { url: '/' })
      })

    const { bookingId } = details || {}

    const visitsWithVisitors = await elite2Api.getVisitsForBookingWithVisitors(res.locals, bookingId, {
      fromDate: fromDate && moment(fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      page,
      paged: true,
      size: pageSize,
      toDate: toDate && moment(toDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
      visitType,
    })

    const {
      content: visits,
      pageable: { offset, pageNumber },
      totalElements,
      totalPages,
    } = visitsWithVisitors

    const sortByLeadThenAge = (left, right) => {
      if (right.leadVisitor) return 1
      if (!right.dateOfBirth) return -1

      return sortByDateTime(left.dateOfBirth, right.dateOfBirth)
    }

    const results =
      hasLength(visits) &&
      visits
        .sort((left, right) => sortByDateTime(right.visitDetails.startTime, left.visitDetails.startTime))
        .map(visit =>
          visit.visitors.sort(sortByLeadThenAge).map((visitor, i, arr) => {
            const {
              visitDetails: {
                eventStatus,
                eventStatusDescription,
                cancelReasonDescription,
                eventOutcomeDescription,
                startTime,
              },
            } = visit

            const status =
              eventStatus === 'CANC' ? `${eventStatusDescription}: ${cancelReasonDescription}` : eventOutcomeDescription

            return {
              age: `${visitor.dateOfBirth ? moment().diff(visitor.dateOfBirth, 'years') : 'Not entered'}`,
              date: startTime,
              isFirst: i === 0,
              isLast: i + 1 === arr.length,
              name: `${formatName(visitor.firstName, visitor.lastName)} ${visitor.leadVisitor ? '(lead visitor)' : ''}`,
              relationship: visitor.relationship,
              status,
            }
          })
        )
        .flat()

    return res.render('prisonerProfile/prisonerVisits/prisonerVisits.njk', {
      breadcrumbPrisonerName: putLastNameFirst(details.firstName, details.lastName),
      dpsUrl,
      formValues: req.query,
      offenderNo,
      pagination: generatePagination({
        totalPages,
        totalElements,
        pageNumber,
        pageSize,
        offset,
        url,
      }),
      prisonerName: formatName(details.firstName, details.lastName),
      results,
      visitTypes: hasLength(visitTypes) && visitTypes.map(type => ({ value: type.code, text: type.description })),
    })
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }
}
