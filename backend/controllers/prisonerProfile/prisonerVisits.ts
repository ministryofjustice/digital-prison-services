import moment from 'moment'
import { hasLength, formatName, putLastNameFirst, sortByDateTime } from '../../utils'
import generatePagination from '../../shared/generatePagination'
import { DATE_TIME_FORMAT_SPEC, MOMENT_TIME } from '../../../common/dateHelpers'

export const VISIT_TYPES = [
  { value: 'SCON', text: 'Social' },
  { value: 'OFFI', text: 'Official' },
]

const calculateStatus = ({ cancelReasonDescription, completionStatusDescription, completionStatus, startTime }) => {
  switch (completionStatus) {
    case 'CANC':
      return cancelReasonDescription ? `Cancelled: ${cancelReasonDescription}` : 'Cancelled'
    case 'SCH': {
      const start = moment(startTime, DATE_TIME_FORMAT_SPEC)
      return start.isAfter(moment(), 'minute') ? 'Scheduled' : 'Not entered'
    }
    default:
      return completionStatusDescription
  }
}

export default ({ prisonApi, pageSize = 20 }) =>
  async (req, res, next) => {
    const { offenderNo } = req.params
    const { visitType, fromDate, toDate, page = 0, establishment } = req.query
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

    try {
      const details = await prisonApi.getDetails(res.locals, offenderNo)
      const { bookingId } = details || {}

      const [visitsWithVisitors, prisons] = await Promise.all([
        prisonApi.getVisitsForBookingWithVisitors(res.locals, bookingId, {
          fromDate: fromDate && moment(fromDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          page,
          paged: true,
          size: pageSize,
          toDate: toDate && moment(toDate, 'DD/MM/YYYY').format('YYYY-MM-DD'),
          visitType,
          prison: establishment,
        }),
        prisonApi.getVisitsPrisons(res.locals, bookingId),
      ])
        .then((data) => data)
        .catch(next)

      const {
        content: visits,
        pageable: { offset, pageNumber },
        totalElements,
        totalPages,
      } = visitsWithVisitors

      const sortByLastName = (a: string, b: string): number => a.localeCompare(b, 'en', { ignorePunctuation: true })

      const sortByLeadThenAgeThenSurname = (left, right) => {
        if (right.leadVisitor) return 1
        if (left.leadVisitor) return -1

        const dateOfBirthSort = sortByDateTime(left.dateOfBirth, right.dateOfBirth)
        return dateOfBirthSort !== 0 ? dateOfBirthSort : sortByLastName(left.lastName, right.lastName)
      }

      const results =
        hasLength(visits) &&
        visits
          .sort((left, right) => sortByDateTime(right.visitDetails.startTime, left.visitDetails.startTime))
          .map((visit) =>
            visit.visitors.sort(sortByLeadThenAgeThenSurname).map((visitor, i, arr) => {
              const {
                visitDetails: { startTime, endTime, visitTypeDescription, prison },
              } = visit
              const status = calculateStatus(visit.visitDetails)

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
                relationship: visitor.relationship || 'Not entered',
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
        visitTypes: VISIT_TYPES,
        filterApplied: Boolean(fromDate || toDate || visitType),
        prisons: hasLength(prisons) && prisons.map((type) => ({ value: type.prisonId, text: type.prison })),
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
