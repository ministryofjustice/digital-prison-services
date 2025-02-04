const { stubFor, getMatchingRequests } = require('./wiremock')
const absenceReasons = require('./responses/absenceReasons.json')
const attendance = require('./responses/attendance.json')

module.exports = {
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/whereabouts/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  stubAttendanceChanges: (changes, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/whereabouts/attendances/changes\\?fromDateTime=.+?&toDateTime=.+?',
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
    }),
  stubAttendanceStats: (agencyId, fromDate, period, stats, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/attendance-statistics/${agencyId}/over-date-range?fromDate=${fromDate}&toDate=${fromDate}&period=${period}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: stats,
      },
    }),
  stubGetAbsences: (agencyId, reason, absences, reasonDescription) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/attendances/${agencyId}/absences-for-scheduled-activities/${reason}?.*`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          absences,
          description: reasonDescription,
        },
      },
    }),
  stubGetAbsenceReasons: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/whereabouts/absence-reasons',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: absenceReasons,
      },
    }),
  stubCourtLocations: (locations, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: '/whereabouts/court/courts',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || [
          { id: 'LDN', name: 'London' },
          { id: 'SHF', name: 'Sheffield' },
          { id: 'LDS', name: 'Leeds' },
        ],
      },
    }),
  stubGetAttendance: (caseload, locationId, timeSlot, date, data = attendance) => {
    const dateAndTimeSlotParameters = date ? `date=${date}&period=${timeSlot}` : '.*'

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/attendances/.+?/${locationId}\\?${dateAndTimeSlotParameters}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: data,
      },
    })
  },
  stubGetAttendancesForBookings: (caseload, timeSlot, date, data = []) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/whereabouts/attendances/${caseload}?date=${date}&period=${timeSlot}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: data,
      },
    }),
  stubPostAttendance: (attendanceToReturn) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/whereabouts/attendance`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: attendanceToReturn,
      },
    }),
  stubPutAttendance: (attendanceToReturn) =>
    stubFor({
      request: {
        method: 'PUT',
        urlPattern: `/whereabouts/attendances/${attendanceToReturn.id}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: attendanceToReturn,
      },
    }),
  stubAddVideoLinkBooking: (status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        url: '/whereabouts/court/video-link-bookings',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: 1 || {},
      },
    }),
  getBookingRequest: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: '/whereabouts/court/video-link-bookings',
    }).then((data) => {
      const { requests } = data.body
      return JSON.parse(requests.slice(-1)[0].body)
    }),
  verifyPostAttendance: () =>
    getMatchingRequests({ method: 'POST', urlPath: '/whereabouts/attendance' }).then((data) => data.body.requests),

  stubCellsWithCapacityByGroupName: ({ agencyId, groupName, response }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/locations/cellsWithCapacity/${agencyId}/${groupName}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubLocationConfig: ({ agencyId, response }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/agencies/${agencyId}/locations/whereabouts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubMoveToCell: () =>
    stubFor({
      request: {
        method: 'POST',
        urlPath: '/whereabouts/cell/make-cell-move',
      },
      response: {
        status: 201,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    }),
  stubGetCellMoveReason: (bookingId, bedAssignmentHistorySequence, cellMoveReasonResponse, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/whereabouts/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/${bedAssignmentHistorySequence}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: cellMoveReasonResponse,
      },
    }),
  stubPrisonersUnaccountedFor: (scheduledActivities) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/whereabouts/attendances/[A-Z].+?/unaccounted-for.*',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: scheduledActivities || {},
      },
    }),
  stubAttendanceForBookings: (agencyId, fromDate, toDate, period, attendances, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/whereabouts/attendances/${agencyId}/attendance-over-date-range?fromDate=${fromDate}&toDate=${toDate}&period=${period}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: attendances,
      },
    }),
  stubGetWhereaboutsAppointments: (appointments, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/whereabouts/appointments/[A-Z].+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointments || [],
      },
    }),
  stubCreateAppointment: (appointments, status = 201) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/whereabouts/appointment',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointments || [],
      },
    }),
  stubGetAppointment: ({ appointment = {}, id, status = 200 }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/appointment/${id}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointment,
      },
    }),
  stubDeleteAppointment: ({ id, status = 200 }) =>
    stubFor({
      request: {
        method: 'DELETE',
        urlPattern: `/whereabouts/appointment/${id}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  stubDeleteRecurringAppointmentSequence: ({ id, status = 200 }) =>
    stubFor({
      request: {
        method: 'DELETE',
        urlPattern: `/whereabouts/appointment/recurring/${id}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  stubGetUnacceptableAbsenceCount: ({ offenderNo, unacceptableAbsence }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/attendances/offender/${offenderNo}/unacceptable-absence-count\\?fromDate=.+&toDate=.+`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { acceptableAbsence: 5, unacceptableAbsence, total: 25 },
      },
    }),
  stubGetUnacceptableAbsenceDetail: ({ offenderNo, unacceptableAbsence }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/whereabouts/attendances/offender/${offenderNo}/unacceptable-absences\\?fromDate=.+&toDate=.+&page=.+`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: unacceptableAbsence,
      },
    }),
}
