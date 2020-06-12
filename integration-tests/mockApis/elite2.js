const { stubFor } = require('./wiremock')
const alertTypes = require('./responses/alertTypes')

module.exports = {
  stubUserMe: () => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/users/me',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: {
          firstName: 'JAMES',
          lastName: 'STUART',
          activeCaseLoadId: 'MDI',
        },
      },
    })
  },
  stubUserCaseloads: caseloads => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/users/me/caseLoads',
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
          },
        ],
      },
    })
  },
  stubUserScheduledActivities: activities => {
    return stubFor({
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
    })
  },
  stubIepSummaryForBookingIds: results => {
    return stubFor({
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
    })
  },
  stubOffenderFullDetails: details => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/bookings/offenderNo/.+?\\?fullInfo=true`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || {},
      },
    })
  },
  stubOffenderBasicDetails: details => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/bookings/offenderNo/.+?\\?fullInfo=false`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: details || {},
      },
    })
  },
  stubOffenderCaseNoteSummary: summary => {
    return stubFor({
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
    })
  },
  stubStaffRoles: roles => {
    return stubFor({
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
    })
  },
  stubAlertTypes: () => {
    return stubFor({
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
    })
  },
  stubAlertsForBooking: alerts => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?/alerts\\?query=.+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alerts || [],
      },
    })
  },

  stubAlerts: ({ locationId, alerts }) => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/api/bookings/offenderNo/${locationId}/alerts`,
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: alerts || [],
      },
    })
  },
  stubOffenderImage: () => {
    return stubFor({
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
    })
  },
  stubMainOffence: (offence, status = 200) => {
    return stubFor({
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
    })
  },
  stubPrisonerDetail: prisonerDetail => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/bookings/[0-9]+?',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: prisonerDetail || {},
      },
    })
  },
  stubPrisonerDetails: (prisonerDetails, status = 200) => {
    return stubFor({
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
    })
  },
  stubPrisonerSentenceDetails: (sentenceDetails, status = 200) => {
    return stubFor({
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
    })
  },
  stubPrisonerBalances: (balances, status = 200) => {
    return stubFor({
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
    })
  },
  stubIepSummaryForBooking: (iepSummary, status = 200) => {
    return stubFor({
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
    })
  },
  stubPositiveCaseNotes: (positiveCaseNotes, status = 200) => {
    return stubFor({
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
    })
  },
  stubNegativeCaseNotes: (negativeCaseNotes, status) => {
    return stubFor({
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
    })
  },
  stubAdjudicationsForBooking: (adjudications, status = 200) => {
    return stubFor({
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
    })
  },
  stubNextVisit: (nextVisit, status) => {
    return stubFor({
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
    })
  },
  stubPrisonerVisitBalances: (visitBalances, status) => {
    return stubFor({
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
    })
  },
  stubEventsForToday: (events, status) => {
    return stubFor({
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
    })
  },
  stubProfileInformation: (profileInfo, status) => {
    return stubFor({
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
    })
  },
  stubIdentifiers: (identifiers, status) => {
    return stubFor({
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
    })
  },
  stubOffenderAliases: (aliases, status) => {
    return stubFor({
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
    })
  },
  stubPrisonerProperty: property => {
    return stubFor({
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
    })
  },
  stubPrisonerContacts: contacts => {
    return stubFor({
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
    })
  },
  stubSecondaryLanguages: secondaryLanguages => {
    return stubFor({
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
    })
  },
  stubPrisonerAddresses: addresses => {
    return stubFor({
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
    })
  },
  stubPersonAddresses: addresses => {
    return stubFor({
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
    })
  },
  stubPersonEmails: emails => {
    return stubFor({
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
    })
  },
  stubPersonPhones: phones => {
    return stubFor({
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
    })
  },
  stubTreatmentTypes: treatmentTyes => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/reference-domains/domains/HEALTH_TREAT',
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: treatmentTyes || [],
      },
    })
  },
  stubHealthTypes: healthTypes => {
    return stubFor({
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
    })
  },
  stubPersonalCareNeeds: careNeeds => {
    return stubFor({
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
    })
  },
  stubReasonableAdjustments: reasonableAdjustments => {
    return stubFor({
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
    })
  },
  stubAgencies: agencies => {
    return stubFor({
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
    })
  },
  stubGetSentenceAdjustments: response => {
    return stubFor({
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
    })
  },
  stubVisits: (visits, status = 200) => {
    return stubFor({
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
    })
  },
  stubLocation: (locationId, locationData, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/locations/[0-9]+?',
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
    })
  },
  stubSentenceData: (offenderSentenceDetail, status = 200) => {
    return stubFor({
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
    })
  },
  stubCourtEvents: (courtEvents, status = 200) => {
    return stubFor({
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
    })
  },
  stubActivities: (activities, status = 200) => {
    return stubFor({
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
    })
  },
  stubPostAppointments: (appointments, status = 200) => {
    return stubFor({
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
    })
  },
  stubAppointments: (appointments, status = 200) => {
    return stubFor({
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
    })
  },
  stubExternalTransfers: (transfers, status = 200) => {
    return stubFor({
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
    })
  },
  stubAppointmentLocations: (locations, status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/api/agencies/.+?/locations?eventType=APP',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: locations || [],
      },
    })
  },
  stubAppointmentTypes: (types, status = 200) => {
    return stubFor({
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
    })
  },
  stubAgencyDetails: (agencyId, details, status = 200) => {
    return stubFor({
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
    })
  },
  stubAppointmentsForBooking: (appointments, status = 200) => {
    return stubFor({
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
    })
  },
  stubUsageAtAgency: (agency, type, locations, status = 200) => {
    return stubFor({
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
    })
  },
  stubSchedulesAtAgency: (agency, location, type, date, schedules, status = 200) => {
    return stubFor({
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
    })
  },
  stubSchedulesAtLocation: (location, type, date, schedules, status = 200) => {
    return stubFor({
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
    })
  },
  stubActivityLocations: (locations, status = 200) => {
    return stubFor({
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
    })
  },
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
  stubActivitySchedules: (location, date, activities, status = 200) =>
    stubFor({
      request: {
        method: 'GET',
        url: `/api/schedules/locations/${location}/activities?date=${date}&includeSuspended=false`,
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: activities || [],
      },
    }),
}
