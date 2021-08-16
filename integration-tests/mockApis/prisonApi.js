const { stubFor, postFor, verifyPut, verifyGet, verifyPosts, resetStub } = require('./wiremock')
const alertTypes = require('./responses/alertTypes.json')
const cellAttributes = require('./responses/cellAttributes.json')
const assessmentsResponse = require('./responses/assessmentsResponse.json')
const activity3 = require('./responses/activity3.json')

module.exports = {
  verifyMoveToCell: body => verifyPosts('/whereabouts/cell/make-cell-move', body),
  verifyMoveToCellSwap: ({ bookingId }) => verifyPut(`/api/bookings/${bookingId}/move-to-cell-swap`),
  verifyAdjudicationsHistory: ({ offenderNo, agencyId, finding, fromDate, toDate }) =>
    verifyGet(
      `/api/offenders/${offenderNo}/adjudications?agencyId=${agencyId}&finding=${finding}&fromDate=${fromDate}&toDate=${toDate}`
    ),
  stubHealth: (status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        fixedDelayMilliseconds: status === 500 ? 5000 : '',
      },
    }),
  stubStaff: (staffId, details) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/users/${encodeURIComponent(staffId)}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || {
          firstName: 'JAMES',
          lastName: 'STUART',
          activeCaseLoadId: 'MDI',
        },
      },
    }),
  stubUserCaseloads: caseloads =>
    stubFor({
      request: {
        method: 'GET',
        url: '/api/users/me/caseLoads',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: caseloads || [
          {
            caseLoadId: 'MDI',
            description: 'Moorland',
            currentlyActive: true,
          },
        ],
      },
    }),
  stubUpdateCaseload: () =>
    stubFor({
      request: {
        method: 'PUT',
        url: '/api/users/me/activeCaseLoad',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  stubUserLocations: locations =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/users/me/locations',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || [
          {
            locationId: 1,
            locationType: 'INST',
            description: 'Moorland (HMP & YOI)',
            agencyId: 'MDI',
            locationPrefix: 'MDI',
          },
          {
            locationId: 2,
            locationType: 'WING',
            description: 'Houseblock 1',
            agencyId: 'MDI',
            locationPrefix: 'MDI-1',
            userDescription: 'Houseblock 1',
          },
          {
            locationId: 3,
            locationType: 'WING',
            description: 'Houseblock 2',
            agencyId: 'MDI',
            locationPrefix: 'MDI-2',
            userDescription: 'Houseblock 2',
          },
        ],
      },
    }),
  stubUserScheduledActivities: activities =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/schedules/.+?/activities-by-event-ids',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: activities,
      },
    }),
  stubOffenderActivitiesOverDateRange: (agencyId, fromDate, toDate, period, suspensions) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/schedules/${agencyId}/activities-by-date-range?fromDate=${fromDate}&toDate=${toDate}&timeSlot=${period}&includeSuspended=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: suspensions,
      },
    }),
  stubOffenderActivities: activities =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/schedules/[A-Z].+?/activities.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: activities || [],
      },
    }),
  stubProgEventsAtLocation: (locationId, timeSlot, date, activities, suspended = true) => {
    const dateAndTimeSlotParameters = date ? `${timeSlot ? `timeSlot=${timeSlot}&` : ''}date=${date}` : '.+?'

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/schedules/locations/${locationId}/activities\\?${dateAndTimeSlotParameters}&includeSuspended=${suspended}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: activities,
      },
    })
  },
  stubUsageAtLocation: (caseload, locationId, timeSlot, date, usage, json = []) => {
    const dateAndTimeSlotParameters = date ? `${timeSlot ? `timeSlot=${timeSlot}&` : ''}date=${date}` : '.*'

    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/schedules/.+?/${locationId}/usage/${usage}\\?${dateAndTimeSlotParameters}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: json,
      },
    })
  },
  stubAssessments: (offenderNumbers, emptyResponse = false) => {
    const json = emptyResponse ? [] : assessmentsResponse

    return stubFor({
      request: {
        method: 'POST',
        url: '/api/offender-assessments/CATEGORY',
        bodyPatterns: [{ equalToJson: offenderNumbers, ignoreArrayOrder: true, ignoreExtraElements: false }],
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: json,
      },
    })
  },
  stubCsraAssessments: (offenderNumbers, assessments = []) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/offender-assessments/csra/list',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: assessments,
      },
    }),
  stubCsraAssessmentsForPrisoner: ({ offenderNo, assessments = [] }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/offender-assessments/csra/${offenderNo}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: assessments,
      },
    }),
  stubCsraReviewForPrisoner: ({ bookingId, assessmentSeq, review = {} }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/offender-assessments/csra/${bookingId}/assessment/${assessmentSeq}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: review,
      },
    }),
  stubIepSummaryForBookingIds: results =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/offenders/iepSummary\\?.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: results,
      },
    }),
  stubOffenderSentences: (offenderNumbers, date) =>
    stubFor({
      request: {
        method: 'POST',
        url: '/api/offender-sentences',
        bodyPatterns: [{ equalToJson: offenderNumbers }],
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: [
          {
            offenderNo: activity3.offenderNo,
            sentenceDetail: { releaseDate: date },
          },
        ],
      },
    }),
  stubOffenderFullDetails: details =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/bookings/offenderNo/.+?\\?fullInfo=true&csraSummary=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || {},
      },
    }),
  stubOffenderBasicDetails: offender =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/bookings/offenderNo/.+?\\?fullInfo=false&csraSummary=false`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offender || {},
      },
    }),
  stubOffenderCaseNoteSummary: summary =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/case-notes/summary\\?.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: summary || [],
      },
    }),
  stubStaffRoles: roles =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/staff/.+?/.+?/roles`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: roles || [{ role: 'KW' }],
      },
    }),
  stubAlertTypes: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/reference-domains/alertTypes',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alertTypes,
      },
    }),
  stubAlertsForBooking: alerts =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/alerts/v2\\?.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: { content: alerts || [] },
      },
    }),

  stubAlerts: ({ alerts }) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: `/api/bookings/offenderNo/.+?/alerts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alerts || [],
      },
    }),
  stubGetAlerts: ({ agencyId, alerts }) =>
    stubFor({
      request: {
        method: 'POST',
        urlPathPattern: `/api/bookings/offenderNo/${agencyId}/alerts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alerts || [],
      },
    }),
  stubGetAlert: ({ bookingId, alertId, alert }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/bookings/${bookingId}/alerts/${alertId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alert || {},
      },
    }),
  stubPutAlert: ({ bookingId, alertId, alert, status = 200 }) =>
    stubFor({
      request: {
        method: 'PUT',
        url: `/api/bookings/${bookingId}/alert/${alertId}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alert || {},
      },
    }),
  stubCreateAlert: () =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/bookings/[0-9].+?/alert',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    }),
  stubMovementsBetween: ({ locationId, fromDate, movements }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/movements/${locationId}/in\\?fromDateTime=${encodeURIComponent(fromDate)}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movements || [],
      },
    }),
  stubMovementsIn: ({ agencyId, fromDate, movements }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/movements/${agencyId}/in/${fromDate}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movements || [],
      },
    }),
  stubMovementsOut: ({ agencyId, fromDate, movements }) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/movements/${agencyId}/out/${encodeURIComponent(fromDate)}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movements || [],
      },
    }),
  stubCurrentlyOut: (livingUnitId, movements) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/movements/livingUnit/${livingUnitId}/currently-out`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movements || [],
      },
    }),
  stubTotalCurrentlyOut: (agencyId, movements) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/movements/agency/${agencyId}/currently-out`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movements || [],
      },
    }),
  stubOffenderImage: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/offenderNo/.+?/image/data\\?fullSizeImage=false',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'image/jpeg',
        },
        base64Body:
          '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==',
      },
    }),
  stubMainOffence: (offence, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/mainOffence',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offence || [],
      },
    }),
  stubPrisonerDetail: (prisonerDetail, bookingId = '[0-9]+?') =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/bookings/${bookingId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: prisonerDetail || {},
      },
    }),
  stubPrisonerFullDetail: (prisonerDetail, offenderNo, fullInfo = true) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/bookings/offenderNo/${offenderNo}?fullInfo=${fullInfo}&csraSummary=${fullInfo}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: prisonerDetail || {},
      },
    }),
  stubPrisonerDetails: (prisonerDetails, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/prisoners/.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: prisonerDetails || [],
      },
    }),
  stubPrisonerSentenceDetails: (sentenceDetails, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/offenders/.+?/sentences',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: sentenceDetails || {},
      },
    }),
  stubPrisonerBalances: (balances, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/balances',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: balances || {},
      },
    }),
  stubIepSummaryForBooking: (iepSummary, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/iepSummary\\?.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: iepSummary || {},
      },
    }),
  stubPositiveCaseNotes: (positiveCaseNotes, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/caseNotes/POS/IEP_ENC/count\\?.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: positiveCaseNotes || {},
      },
    }),
  stubNegativeCaseNotes: (negativeCaseNotes, status) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/caseNotes/NEG/IEP_WARN/count\\?.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: negativeCaseNotes || {},
      },
    }),
  stubAdjudicationsForBooking: (adjudications, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/adjudications',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: adjudications || {},
      },
    }),
  stubNextVisit: (nextVisit, status) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/visits/next',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: nextVisit || {},
      },
    }),
  stubVisitsWithVisitors: (visitsWithVisitors, status) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/visits-with-visitors\\?.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: visitsWithVisitors || {
          content: [],
          pageable: {
            sort: {},
            offset: 0,
            pageNumber: 0,
            pageSize: 20,
            paged: true,
            unpaged: false,
          },
          totalPages: 0,
          totalElements: 0,
          last: false,
          first: true,
          number: 0,
          size: 0,
          numberOfElements: 0,
          empty: false,
        },
      },
    }),
  stubVisitTypes: (visitTypes, status) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/reference-domains/domains/VISIT_TYPE',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: visitTypes || [
          { code: 'OFFI', description: 'Official visit' },
          { code: 'SCON', description: 'Social contact' },
        ],
      },
    }),
  stubPrisonerVisitBalances: (visitBalances, status) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/offenderNo/.+?/visit/balances',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: visitBalances || {},
      },
    }),
  stubEventsForToday: (events, status) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/events/today',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: events || [],
      },
    }),
  stubProfileInformation: (profileInfo, status) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/profileInformation',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: profileInfo || [],
      },
    }),
  stubIdentifiers: (identifiers, status) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/identifiers',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: identifiers || [],
      },
    }),
  stubOffenderAliases: (aliases, status) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/aliases',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: aliases || [],
      },
    }),
  stubPrisonerProperty: property =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/property',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: property || [],
      },
    }),
  stubPrisonerContacts: contacts =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/contacts',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: contacts || [],
      },
    }),
  stubSecondaryLanguages: secondaryLanguages =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/secondary-languages',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: secondaryLanguages || [],
      },
    }),
  stubPrisonerAddresses: addresses =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/offenders/.+?/addresses',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: addresses || [],
      },
    }),
  stubPersonAddresses: addresses =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/persons/.+?/addresses',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: addresses || [],
      },
    }),
  stubPersonEmails: emails =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/persons/.+?/emails',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: emails || [],
      },
    }),
  stubPersonPhones: phones =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/persons/.+?/phones',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: phones || [],
      },
    }),
  stubTreatmentTypes: treatmentTypes =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/reference-domains/domains/HEALTH_TREAT',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: treatmentTypes || [],
      },
    }),
  stubHealthTypes: healthTypes =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/reference-domains/domains/HEALTH',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: healthTypes || [],
      },
    }),
  stubPersonalCareNeeds: careNeeds =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/personal-care-needs\\?.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: careNeeds || {},
      },
    }),
  stubReasonableAdjustments: reasonableAdjustments =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/reasonable-adjustments\\?.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: reasonableAdjustments || {},
      },
    }),
  stubAgencies: agencies =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/agencies/prison',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: agencies || [],
      },
    }),
  stubGetSentenceAdjustments: response =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/sentenceAdjustments',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubVisits: (visits, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/schedules/[A-Z].+?/visits.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: visits || [],
      },
    }),
  stubLocation: (locationId, locationData, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/locations/${locationId}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locationData || {
          locationId,
          locationType: 'WING',
          description: 'HB1',
          agencyId: 'RNI',
          currentOccupancy: 243,
          locaitionPrefix: 'RNI-HB1',
          internalLocationCode: 'HB1',
        },
      },
    }),
  stubSentenceData: (offenderSentenceDetail, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/offender-sentences',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offenderSentenceDetail || [],
      },
    }),
  stubCourtEvents: (courtEvents, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/schedules/.+?/courtEvents.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: courtEvents || [],
      },
    }),
  stubActivities: (activities, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/schedules/[A-Z].+?/activities.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: activities || [],
      },
    }),
  stubPostAppointments: (appointments, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/appointments',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointments || [],
      },
    }),
  stubAppointments: (appointments, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/schedules/[A-Z].+?/appointments.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointments || [],
      },
    }),
  stubAppointmentsGet: (appointments, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/schedules/[A-Z].+?/appointments.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointments || [],
      },
    }),
  stubExternalTransfers: (transfers, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/schedules/[A-Z].+?/externalTransfers.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: transfers || [],
      },
    }),
  stubLocationsForAgency: (agency, locations, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/agencies/${agency}/locations`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || [],
      },
    }),
  stubAppointmentLocations: (agency, locations, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/agencies/${agency}/locations?eventType=APP`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || [],
      },
    }),
  stubAppointmentTypes: (types, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: '/api/reference-domains/scheduleReasons?eventType=APP',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: types || [],
      },
    }),
  stubAgencyDetails: (agencyId, details, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/agencies/${agencyId}?activeOnly=false`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || {},
      },
    }),
  stubAppointmentsForBooking: (appointments, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/bookings/[0-9]+?/appointments',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: appointments || [],
      },
    }),
  stubUsageAtAgency: (agency, type, locations, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/agencies/${agency}/locations?eventType=${type}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || [
          {
            locationId: 1,
            userDescription: 'loc1',
          },
          {
            locationId: 2,
            userDescription: 'loc2',
          },
          {
            locationId: 3,
            userDescription: 'loc3',
          },
        ],
      },
    }),
  stubSchedulesAtAgency: (agency, location, type, date, schedules, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/schedules/${agency}/locations/${location}/usage/${type}?date=${date}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: schedules || [],
      },
    }),
  stubSchedulesAtLocation: (location, type, date, schedules, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/schedules/locations/${location}/usage/${type}?date=${date}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: schedules || [],
      },
    }),
  stubActivityLocations: (locations, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/agencies/.+?/eventLocationsBooked.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || [
          {
            locationId: 1,
            userDescription: 'loc1',
          },
          {
            locationId: 2,
            userDescription: 'loc2',
          },
          {
            locationId: 3,
            userDescription: 'loc3',
          },
        ],
      },
    }),
  stubActivityLocationsConnectionResetFault: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/agencies/.+?/eventLocationsBooked.+?',
      },
      response: {
        fault: 'CONNECTION_RESET_BY_PEER',
      },
    }),
  stubActivityLocationsByDateAndPeriod: (locations, date, period, withFault) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/agencies/MDI/eventLocationsBooked?bookedOnDay=${date}&timeSlot=${period}`,
      },
      response: withFault
        ? {
            fault: 'CONNECTION_RESET_BY_PEER',
          }
        : {
            status: 200,
            headers: {
              'Content-Type': 'application/json;charset=UTF-8',
            },
            jsonBody: locations,
          },
    }),
  stubInmates: ({ locationId, params, count, data = [] }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/api/locations/description/${locationId}/inmates`,
        queryParameters: params,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'total-records': `${count}`,
        },
        jsonBody: data,
      },
    }),
  stubActivitySchedules: (location, date, activities, status = 200, timeSlot, suspended = false) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/schedules/locations/${location}/activities?${
          timeSlot ? `timeSlot=${timeSlot}&` : ''
        }date=${date}&includeSuspended=${suspended}`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: activities || [],
      },
    }),
  stubBookingOffenders: (offenders, status = 200) =>
    stubFor({
      request: {
        method: 'POST',
        url: '/api/bookings/offenders',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offenders || [],
      },
    }),
  stubCourtCases: courtCases =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/bookings/[0-9]+?/court-cases',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: courtCases || [],
      },
    }),
  stubOffenceHistory: offenceHistory =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/bookings/offenderNo/.+?/offenceHistory',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: offenceHistory || [],
      },
    }),
  stubSentenceTerms: sentenceTerms =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/offender-sentences/booking/[0-9]+?/sentenceTerms',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: sentenceTerms || [],
      },
    }),
  stubScheduledEventsForThisWeek: (events, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/events/thisWeek',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: events || [],
      },
    }),
  stubScheduledEventsForNextWeek: (events, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/events/nextWeek',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: events || [],
      },
    }),
  stubOffenderMovements: () =>
    postFor({
      urlPath: '/api/movements/offenders',
      body: [
        {
          offenderNo: 'T1001AA',
          createDateTime: '2016-05-04T09:24:46.254162',
          fromAgency: 'LNI',
          fromAgencyDescription: 'Low Newton (HMP)',
          toAgency: 'OUT',
          toAgencyDescription: 'Outside',
          movementType: 'REL',
          movementTypeDescription: 'Release',
          directionCode: 'OUT',
        },
      ],
    }),
  stubBookingDetails: details =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/offenderNo/.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || {},
      },
    }),
  stubBookingNonAssociations: response =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9].+?/non-association-details',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubCellAttributes: () =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/reference-domains/domains/HOU_UNIT_ATT',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: cellAttributes,
      },
    }),
  stubCellsWithCapacity: cells =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/agencies/.+?/cellsWithCapacity',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: cells,
      },
    }),

  stubInmatesAtLocation: inmates =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/locations/.+?/inmates',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: inmates || [],
      },
    }),

  stubOffenderCellHistory: history =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/bookings/[0-9]+?/cell-history',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: history || { content: [] },
      },
    }),
  stubHistoryForLocation: locationHistory =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/cell/[0-9]+?/history',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locationHistory || [],
      },
    }),
  stubAttributesForLocation: locationAttributes =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/cell/[0-9]+?/attributes',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locationAttributes || {},
      },
    }),
  stubAssignedMovements: (agencyId, movements) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/movements/rollcount/${agencyId}?unassigned=false`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movements || {},
      },
    }),
  stubUnassignedMovements: (agencyId, movements) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/movements/rollcount/${agencyId}?unassigned=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movements || {},
      },
    }),
  stubGetAdjudicationDetails: adjudicationDetails =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: `/api/offenders/.+?/adjudications/[0-9]+?`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: adjudicationDetails || {},
      },
    }),
  stubRollcountByType: (agencyId, type, movements) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/movements/rollcount/${agencyId}/${type}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movements || {},
      },
    }),
  stubEnRoute: (agencyId, movements) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/movements/${agencyId}/enroute`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: movements || {},
      },
    }),
  stubGetEventsByLocationIds: (agencyId, date, timeSlot, response) =>
    stubFor({
      request: {
        method: 'POST',
        url: `/api/schedules/${agencyId}/events-by-location-ids?date=${date}&timeSlot=${timeSlot}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || {},
      },
    }),
  stubMoveToCellSwap: () =>
    stubFor({
      request: {
        method: 'PUT',
        urlPathPattern: '/api/bookings/[0-9]+?/move-to-cell-swap',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {},
      },
    }),
  stubAdjudicationFindingTypes: types =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/reference-domains/domains/OIC_FINDING',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: types,
      },
    }),
  stubAdjudications: (response, headers = {}) =>
    stubFor({
      request: {
        method: 'GET',
        urlPathPattern: '/api/offenders/A12345/adjudications',
      },
      response: {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubPrisonApiGlobalSearch: response =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: '/api/prisoners',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  resetAdjudicationsStub: () => resetStub({ requestUrl: '/api/offenders/A12345/adjudications', method: 'GET' }),
  stubSystemAlerts: alerts =>
    stubFor({
      request: {
        method: 'POST',
        url: '/api/bookings/offenderNo/alerts',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alerts || [],
      },
    }),
  stubGetAgencyIepLevels: response =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/agencies/.+?/iepLevels',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response,
      },
    }),
  stubChangeIepLevel: body =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/bookings/[0-9]+?/iepLevels',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: body,
      },
    }),
  stubGetPrisonerDamageObligations: response =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/offenders/.+?/damage-obligations',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || { damageObligations: [] },
      },
    }),
  stubGetTransactionHistory: ({ response, transactionType, fromDate, toDate, accountCode }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/offenders/.+?/transaction-history\\?${fromDate ? `from_date=${fromDate}&` : ''}${
          toDate ? `to_date=${toDate}&` : ''
        }account_code=${accountCode}${transactionType ? `&transaction_type=${transactionType}` : ''}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || [],
      },
    }),
  stubGetStaffDetails: (staffId, response) =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/users/${staffId}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: response || {},
      },
    }),
  stubGetDetailsFailure: status =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/offenderNo/.+?',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      },
    }),
  stubGetPrisoners: body =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/prisoners',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: body,
      },
    }),
  stubGetUserDetailsList: body =>
    stubFor({
      request: {
        method: 'POST',
        urlPattern: '/api/users/list',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: body,
      },
    }),
  stubCellMoveHistory: ({ assignmentDate, agencyId, cellMoves }) =>
    stubFor({
      request: {
        method: 'GET',
        urlPath: `/api/cell/${agencyId}/history/${assignmentDate}`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: cellMoves,
      },
    }),
  stubCellMoveTypes: types =>
    stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/reference-domains/domains/CHG_HOUS_RSN',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: types,
      },
    }),
}
