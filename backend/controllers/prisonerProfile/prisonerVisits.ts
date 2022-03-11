import moment from 'moment'
import { compareNumbers, compareStrings, formatName, hasLength, putLastNameFirst, sortByDateTime } from '../../utils'
import generatePagination from '../../shared/generatePagination'
import { DATE_TIME_FORMAT_SPEC, MOMENT_TIME } from '../../../common/dateHelpers'

export const VISIT_TYPES = [
  { value: 'SCON', text: 'Social' },
  { value: 'OFFI', text: 'Official' },
]

const sortByListSequenceThenDescription = (left, right): number => {
  const listSeqSort = compareNumbers(left.listSeq, right.listSeq)
  return listSeqSort !== 0 ? listSeqSort : compareStrings(left.description, right.description)
}

const sortByLeadIf18OrOverThenAgeThenLastNameFirstName = (left, right): number => {
  if (right.leadVisitor && right.age >= 18) return 1
  if (left.leadVisitor && left.age >= 18) return -1

  // age set to 18 for people with no dob - assumed to be adults.  Need to sort them above the children
  if (right.age - left.age !== 0) return right.age - left.age

  const dateOfBirthSort = sortByDateTime(left.dateOfBirth, right.dateOfBirth)
  const lastNameSort = dateOfBirthSort !== 0 ? dateOfBirthSort : compareStrings(left.lastName, right.lastName)
  return lastNameSort !== 0 ? lastNameSort : compareStrings(left.firstName, right.firstName)
}

const calculateDateAndStatusFilter = (status: string, fromDate: string, toDate: string) => {
  const fromAsDate = fromDate ? moment(fromDate, 'DD/MM/YYYY') : undefined
  const toAsDate = toDate ? moment(toDate, 'DD/MM/YYYY') : undefined

  const now = moment().startOf('day')
  if (status === 'EXP') return { visitStatus: 'SCH', fromAsDate, toAsDate: toAsDate?.isBefore(now) ? toAsDate : now }
  if (status === 'SCH') return { visitStatus: 'SCH', fromAsDate: fromAsDate?.isAfter(now) ? fromAsDate : now, toAsDate }
  const splitStatus = status?.split('-')
  const visitStatus = splitStatus?.shift()
  const cancellationReason = splitStatus?.shift()
  return { visitStatus, cancellationReason, fromAsDate, toAsDate }
}

const calculateChildAgeAsText = (age: number, dateOfBirth: string): string => {
  if (age === 0) {
    const months = moment().diff(dateOfBirth, 'months')
    if (months === 1) return ' - 1 month old'
    if (months === 0) {
      const days = moment().diff(dateOfBirth, 'days')
      return days === 1 ? ' - 1 day old' : ` - ${days} days old`
    }
    return ` - ${months} months old`
  }
  if (age === 1) return ' - 1 year old'
  return age < 18 ? ` - ${age} years old` : ''
}

const calculateStatus = ({
  cancelReasonDescription,
  completionStatusDescription,
  completionStatus,
  searchTypeDescription,
  startTime,
}) => {
  switch (completionStatus) {
    case 'CANC':
      return { status: 'Cancelled', subStatus: cancelReasonDescription }
    case 'SCH': {
      const start = moment(startTime, DATE_TIME_FORMAT_SPEC)
      if (start.isAfter(moment(), 'minute')) return { status: 'Scheduled' }
      return { status: searchTypeDescription || 'Not entered' }
    }
    default:
      return { status: completionStatusDescription, subStatus: searchTypeDescription }
  }
}

export default ({ prisonApi, pageSize = 20 }) =>
  async (req, res, next) => {
    const { offenderNo } = req.params
    const { visitType, fromDate, toDate, page = 0, status: statusFilter, establishment } = req.query
    const url = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

    try {
      const [details, completionReasons, cancellationReasons] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        prisonApi.getVisitCompletionReasons(res.locals),
        prisonApi.getVisitCancellationReasons(res.locals),
      ])
        .then((data) => data)
        .catch(next)

      const { bookingId } = details || {}

      const { visitStatus, cancellationReason, fromAsDate, toAsDate } = calculateDateAndStatusFilter(
        statusFilter,
        fromDate,
        toDate
      )

      const [visitsWithVisitors, prisons] = await Promise.all([
        prisonApi.getVisitsForBookingWithVisitors(res.locals, bookingId, {
          fromDate: fromAsDate?.format('YYYY-MM-DD'),
          page,
          paged: true,
          size: pageSize,
          toDate: toAsDate?.format('YYYY-MM-DD'),
          visitType,
          prisonId: establishment,
          visitStatus,
          cancellationReason,
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

      const results =
        hasLength(visits) &&
        visits
          .sort((left, right) => sortByDateTime(right.visitDetails.startTime, left.visitDetails.startTime))
          .map((visit) => {
            const visitorsWithAge = visit.visitors.map((v) => ({
              ...v,
              age: v.dateOfBirth ? moment().diff(v.dateOfBirth, 'years') : 18,
            }))

            const sortedVisitors = visitorsWithAge.sort(sortByLeadIf18OrOverThenAgeThenLastNameFirstName)
            const firstChildIndex = sortedVisitors.findIndex((v) => v.age < 18)

            return sortedVisitors.reduce((arr, visitor, i) => {
              const {
                visitDetails: { startTime, endTime, visitTypeDescription, prison },
              } = visit
              const { status, subStatus } = calculateStatus(visit.visitDetails)

              const start = moment(startTime, DATE_TIME_FORMAT_SPEC)
              const end = moment(endTime, DATE_TIME_FORMAT_SPEC)

              const ageAsText = calculateChildAgeAsText(visitor.age, visitor.dateOfBirth)

              if (i === firstChildIndex) {
                arr.push({
                  isFirst: i === 0,
                  isLast: false,
                  date: startTime,
                  time: `${start.format(MOMENT_TIME)} to ${end.format(MOMENT_TIME)}`,
                  type: visitTypeDescription.split(' ').shift(),
                  status,
                  subStatus,
                  nameWithChildAge: 'Children:',
                  lastAdult: false,
                  relationship: '',
                  prison,
                })
              }

              arr.push({
                isFirst: i === 0 && i !== firstChildIndex,
                isLast: i + 1 === sortedVisitors.length,
                date: startTime,
                time: `${start.format(MOMENT_TIME)} to ${end.format(MOMENT_TIME)}`,
                type: visitTypeDescription.split(' ').shift(),
                status,
                subStatus,
                nameWithChildAge: `${formatName(visitor.firstName, visitor.lastName)}${ageAsText}`,
                lastAdult: i === firstChildIndex - 1,
                relationship: visitor.relationship || 'Not entered',
                prison,
              })
              return arr
            }, [])
          })
          .flat()

      const statuses = cancellationReasons
        .sort(sortByListSequenceThenDescription)
        .map((type) => ({ value: `CANC-${type.code}`, text: `Cancelled: ${type.description}` }))
        .concat(
          completionReasons
            .sort(sortByListSequenceThenDescription)
            .filter((reason) => reason.code !== 'CANC' && reason.code !== 'SCH')
            .map((type) => ({ value: type.code, text: type.description }))
        )
        .concat([
          { value: 'SCH', text: 'Scheduled' },
          { value: 'EXP', text: 'Not entered' },
        ])

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
        filterApplied: Boolean(fromDate || toDate || visitType || statusFilter || establishment),
        prisons: hasLength(prisons) ? prisons.map((type) => ({ value: type.prisonId, text: type.prison })) : [],
        statuses,
        profileUrl: `/prisoner/${offenderNo}`,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
