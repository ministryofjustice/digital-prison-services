const moment = require('moment')
const { serviceUnavailableMessage } = require('../../common-messages')
const { hasLength, formatName, putLastNameFirst, sortByDateTime } = require('../../utils')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

module.exports = ({ paginationService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const { visitType, fromDate, toDate, pageOffsetOption } = req.query
  const fullUrl = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`)

  const pageNumber = (pageOffsetOption && parseInt(pageOffsetOption, 10)) || 0
  const pageSize = 2

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

    const response = await elite2Api.getVisitsForBookingWithVisitors(res.locals, bookingId, {
      sorted: true,
      visitType,
      pageNumber,
      pageSize,
      paged: true,
    })

    console.log({ response })

    const { content: visits, size } = response

    const sortByLeadThenAge = (left, right) => {
      if (right.leadVisitor) return 1

      return sortByDateTime(left.dateOfBirth, right.dateOfBirth)
    }

    const results =
      hasLength(visits) &&
      visits.map(visit => {
        return {
          date: visit.visitDetails.startTime,
          ...visit.visitors.sort((left, right) => sortByLeadThenAge(left, right)).reduce(
            (visitors, visitor) => ({
              ages: [
                ...visitors.ages,
                `${visitor.dateOfBirth ? moment().diff(visitor.dateOfBirth, 'years') : 'Not entered'}`,
              ],
              names: [
                ...visitors.names,
                `${formatName(visitor.firstName, visitor.lastName)} ${visitor.leadVisitor ? '(lead visitor)' : ''}`,
              ],
              relationships: [...visitors.relationships, visitor.relationship],
            }),
            {
              ages: [],
              names: [],
              relationships: [],
            }
          ),

          status: visit.visitDetails.eventOutcomeDescription,
        }
      })

    console.log('results', JSON.stringify(results))

    return res.render('prisonerProfile/prisonerVisits/prisonerVisits.njk', {
      breadcrumbPrisonerName: putLastNameFirst(details.firstName, details.lastName),
      dpsUrl,
      formValues: req.query,
      offenderNo,
      pagination: paginationService.getPagination(size, pageNumber, pageSize, fullUrl),
      prisonerName: formatName(details.firstName, details.lastName),
      results,
      visitTypes: hasLength(visitTypes) && visitTypes.map(type => ({ value: type.code, text: type.description })),
    })
    // return res.send(JSON.stringify(visits))
  } catch (error) {
    logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: `/prisoner/${offenderNo}` })
  }
}

// {
//   visitTypes: [
//     {
//       domain: 'VISIT_TYPE',
//       code: 'OFFI',
//       description: 'Official Visit',
//       activeFlag: 'Y',
//       systemDataFlag: 'N',
//       subCodes: []
//     },
//     {
//       domain: 'VISIT_TYPE',
//       code: 'SCON',
//       description: 'Social Contact',
//       activeFlag: 'Y',
//       systemDataFlag: 'N',
//       subCodes: []
//     }
//   ]
// }

// const visits = {
//   content: [
//     {
// visitors: [
//   {
//     personId: 579266,
//     lastName: 'CASSORIA',
//     firstName: 'YRUDYPETER',
//     leadVisitor: true,
//     relationship: 'Probation Officer',
//   },
// ],
//       visitDetails: {
//         eventStatus: 'COMP',
//         eventStatusDescription: 'Completed',
//         visitType: 'OFFI',
//         visitTypeDescription: 'Official Visit',
//         leadVisitor: 'YRUDYPETER CASSORIA',
//         relationship: 'PROB',
//         relationshipDescription: 'Probation Officer',
//         startTime: '2020-06-25T13:30:00',
//         endTime: '2020-06-25T16:00:00',
//         location: 'CLOSED VISITS',
//         eventOutcome: 'ATT',
//         eventOutcomeDescription: 'Attended',
//       },
//     },
//     {
//       visitors: [
//         {
//           personId: 579266,
//           lastName: 'CASSORIA',
//           firstName: 'YRUDYPETER',
//           leadVisitor: true,
//           relationship: 'Probation Officer',
//         },
//       ],
//       visitDetails: {
//         eventStatus: 'EXP',
//         eventStatusDescription: 'Expired',
//         visitType: 'SCON',
//         visitTypeDescription: 'Social Contact',
//         leadVisitor: 'YRUDYPETER CASSORIA',
//         relationship: 'PROB',
//         relationshipDescription: 'Probation Officer',
//         startTime: '2020-04-17T13:30:00',
//         endTime: '2020-04-17T16:00:00',
//         location: 'OFFICIAL VISITS',
//         eventOutcome: 'ATT',
//         eventOutcomeDescription: 'Attended',
//       },
//     },
//     {
//       visitors: [
//         {
//           personId: 579266,
//           lastName: 'CASSORIA',
//           firstName: 'YRUDYPETER',
//           leadVisitor: true,
//           relationship: 'Probation Officer',
//         },
//       ],
//       visitDetails: {
//         eventStatus: 'EXP',
//         eventStatusDescription: 'Expired',
//         visitType: 'OFFI',
//         visitTypeDescription: 'Official Visit',
//         leadVisitor: 'YRUDYPETER CASSORIA',
//         relationship: 'PROB',
//         relationshipDescription: 'Probation Officer',
//         startTime: '2018-08-08T13:30:00',
//         endTime: '2018-08-08T16:00:00',
//         location: 'CLOSED VISITS',
//         eventOutcome: 'ATT',
//         eventOutcomeDescription: 'Attended',
//       },
//     },
//   ],
//   pageable: 'INSTANCE',
//   totalElements: 3,
//   last: true,
//   totalPages: 1,
//   sort: { sorted: false, unsorted: true, empty: true },
//   first: true,
//   number: 0,
//   size: 3,
//   numberOfElements: 3,
//   empty: false,
// }
