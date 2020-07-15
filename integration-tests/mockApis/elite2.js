const { stubFor } = require('./wiremock')
const alertTypes = require('./responses/alertTypes')
const assessmentsResponse = require('./responses/assessmentsResponse')
const activity3 = require('./responses/activity3')

module.exports = {
  stubHealth: (status = 200) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: '/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        fixedDelayMilliseconds: status === 500 ? 5000 : '',
      },
    })
  },
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
            currentlyActive: true,
          },
        ],
      },
    })
  },
  stubUserLocations: locations => {
    return stubFor({
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
  stubProgEventsAtLocation: (locationId, timeSlot, date, activities, suspended = true) => {
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/schedules/locations/${locationId}/activities\\?${
          timeSlot ? `timeSlot=${timeSlot}&` : ''
        }date=${date}&includeSuspended=${suspended}`,
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
    return stubFor({
      request: {
        method: 'GET',
        urlPattern: `/api/schedules/.+?/${locationId}/usage/${usage}\\?${
          timeSlot ? `timeSlot=${timeSlot}&` : ''
        }date=${date}`,
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
        urlPattern: `/api/offender-assessments/CATEGORY`,
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
  stubOffenderSentences: (offenderNumbers, date) => {
    return stubFor({
      request: {
        method: 'POST',
        urlPattern: `/api/offender-sentences`,
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
  stubOffenderBasicDetails: offender => {
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
        jsonBody: offender || {},
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

  stubAlerts: ({ alerts }) => {
    return stubFor({
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
    })
  },
  stubMovementsBetween: ({ locationId, fromDate, movements }) => {
    return stubFor({
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
  stubVisitsWithVisitors: (visitsWithVisitors, status) => {
    return stubFor({
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
    })
  },
  stubVisitTypes: (visitTypes, status) => {
    return stubFor({
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
  stubTreatmentTypes: treatmentTypes => {
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
        jsonBody: treatmentTypes || [],
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
  stubAppointmentLocations: (agency, locations, status = 200) => {
    return stubFor({
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
}
