const { getFor } = require('./wiremock')

module.exports = {
  stubAttendanceChanges: changes =>
    getFor({
      urlPattern: '/attendances/changes\\?fromDateTime=.+?&toDateTime=.+?',
      body: changes,
    }),
  stubAttendanceStats: ({ agencyId, stats }) =>
    getFor({
      urlPath: `/attendance-statistics/${agencyId}/over-date-range`,
      body: stats,
    }),
  stubAbsenceReasons: () =>
    getFor({
      urlPath: '/attendance/absence-reasons',
      body: {
        triggersIEPWarning: ['UnacceptableAbsence', 'RefusedIncentiveLevelWarning'],
        paidReasons: ['ApprovedCourse', 'AcceptableAbsence', 'NotRequired'],
        unpaidReasons: [
          'SessionCancelled',
          'RestInCellOrSick',
          'RestDay',
          'UnacceptableAbsence',
          'Refused',
          'RefusedIncentiveLevelWarning',
        ],
      },
    }),
}
