import moment from 'moment'
import { hasLength, formatName, putLastNameFirst, sortByDateTime } from '../../utils'
import generatePagination from '../../shared/generatePagination'
import { DATE_TIME_FORMAT_SPEC, MOMENT_TIME } from '../../../common/dateHelpers'

export default ({ prisonApi, pageSize = 20 }) =>
  async (req, res, next) => {
    const { offenderNo } = req.params
    const { visitType, fromDate, toDate, page = 0 } = req.query
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

    try {
      const [details, visitTypes] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        prisonApi.getVisitTypes(res.locals),
      ])
        .then((data) => data)
        .catch(next)

      const { bookingId } = details || {}

      const visitsWithVisitors = await prisonApi.getVisitsForBookingWithVisitors(res.locals, bookingId, {
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
          .map((visit) =>
            visit.visitors.sort(sortByLeadThenAge).map((visitor, i, arr) => {
              const {
                visitDetails: {
                  eventStatus,
                  eventStatusDescription,
                  cancelReasonDescription,
                  eventOutcomeDescription,
                  startTime,
                  endTime,
                  visitTypeDescription,
                  prison,
                },
              } = visit

              const status =
                eventStatus === 'CANC'
                  ? `${eventStatusDescription}: ${cancelReasonDescription}`
                  : eventOutcomeDescription

              const start = moment(startTime, DATE_TIME_FORMAT_SPEC)
              const end = moment(endTime, DATE_TIME_FORMAT_SPEC)

              return {
                isFirst: i === 0,
                isLast: i + 1 === arr.length,
                date: startTime,
                time: `${start.format(MOMENT_TIME)} to ${end.format(MOMENT_TIME)}`,
                type: visitTypeDescription.split(' ').shift(),
                status,
                name: formatName(visitor.firstName, visitor.lastName),
                age: `${visitor.dateOfBirth ? moment().diff(visitor.dateOfBirth, 'years') : 'Not entered'}`,
                relationship: visitor.relationship,
                prison,
              }
            })
          )
          .flat()

      return res.render('prisonerProfile/prisonerVisits/prisonerVisits.njk', {
        breadcrumbPrisonerName: putLastNameFirst(details.firstName, details.lastName),
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
        visitTypes: hasLength(visitTypes) && visitTypes.map((type) => ({ value: type.code, text: type.description })),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
