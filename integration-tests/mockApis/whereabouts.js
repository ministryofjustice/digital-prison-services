const { stubFor } = require('./wiremock')
const absenceReasons = require('./responses/absenceReasons')
const attendance = require('./responses/attendance')

module.exports = {
  stubAttendanceChanges: changes => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/attendances/changes\\?fromDateTime=.+?&toDateTime=.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          changes,
        },
      },
    })
  },
  stubGetAbsenceReasons: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/absence-reasons',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          absenceReasons,
        },
      },
    })
  },
  stubGetAttendance: (caseload, locationId, timeSlot, date, data = attendance) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/attendances/${caseload}/${locationId}?date=${date}&period=${timeSlot}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          data,
        },
      },
    })
  },
}
