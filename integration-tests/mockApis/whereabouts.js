const { stubFor } = require('./wiremock')
const absenceReasons = require('./responses/absenceReasons')
const attendance = require('./responses/attendance')

module.exports = {
  stubAttendanceChanges: (changes, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/attendances/changes\\?fromDateTime=.+?&toDateTime=.+?',
      },
      response: {
        status,
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
  stubCourtLocations: (locations, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/court/all-courts',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || {
          courtLocations: ['London', 'Sheffield', 'Leeds'],
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
  stubAddVideoLinkAppointment: (appointment, status = 200) => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/court/add-video-link-appointment',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointment || {},
      },
    })
  },
}
