const { stubFor, verifyPosts, getMatchingRequests } = require('./wiremock')
const absenceReasons = require('./responses/absenceReasons')
const attendance = require('./responses/attendance')

module.exports = {
  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/whereabouts/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    })
  },
  stubAttendanceChanges: (changes, status = 200) => {
    return stubFor({
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
    })
  },
  stubAttendanceStats: (agencyId, fromDate, period, stats, status = 200) => {
    return stubFor({
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
    })
  },
  stubGetAbsenceReasons: () => {
    return stubFor({
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
    })
  },
  stubCourtLocations: (locations, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        url: '/whereabouts/court/all-courts',
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
        urlPattern: `/whereabouts/attendances/.+?/${locationId}\\?date=${date}&period=${timeSlot}`,
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
  stubGetAttendancesForBookings: (caseload, timeSlot, date, data = []) => {
    return stubFor({
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
    })
  },
  stubPostAttendance: attendanceToReturn => {
    return stubFor({
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
    })
  },
  stubPutAttendance: attendanceToReturn => {
    return stubFor({
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
    })
  },
  stubAddVideoLinkBooking: (status = 200) => {
    return stubFor({
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
    })
  },
  getBookingRequest: () =>
    getMatchingRequests({
      method: 'POST',
      urlPath: '/whereabouts/court/video-link-bookings',
    }).then(data => {
      const { requests } = data.body
      return JSON.parse(requests.slice(-1)[0].body)
    }),
  stubVideoLinkAppointments: (appointments, status = 200) => {
    return stubFor({
      request: {
        method: 'POST',
        url: '/whereabouts/court/video-link-appointments',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointments || [],
      },
    })
  },
  verifyPostAttendance: () => {
    return verifyPosts('/whereabouts/attendance')
  },
  stubGroups: (caseload, status = 200) => {
    const json = [
      {
        name: '1',
        key: '1',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
      {
        name: '2',
        key: '2',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
      {
        name: '3',
        key: '3',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
    ]

    const jsonSYI = [
      {
        name: 'block1',
        key: 'block1',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
        ],
      },
      {
        name: 'block2',
        key: 'block2',
        children: [
          {
            name: 'A',
            key: 'A',
          },
          {
            name: 'B',
            key: 'B',
          },
          {
            name: 'C',
            key: 'C',
          },
        ],
      },
    ]

    return stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/agencies/${caseload.id}/locations/groups`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: caseload.id === 'SYI' ? jsonSYI : json,
      },
    })
  },
  stubGetLocationPrefix: ({ agencyId, groupName, response }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/locations/${agencyId}/${groupName}/location-prefix`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),

  stubGetAgencyGroupLocations: ({ agencyId, groupName, response }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/whereabouts/locations/groups/${agencyId}/${groupName}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
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
  stubLocationGroups: locationGroups =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/whereabouts/agencies/.+?/locations/groups',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locationGroups || [],
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
  stubGetCellMoveReason: (bookingId, bedAssignmentHistorySequence, cellMoveReasonResponse) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/whereabouts/cell/cell-move-reason/booking/${bookingId}/bed-assignment-sequence/${bedAssignmentHistorySequence}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: cellMoveReasonResponse,
      },
    }),
}
