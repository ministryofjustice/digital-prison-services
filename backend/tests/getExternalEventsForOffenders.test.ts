// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'moment'.
const moment = require('moment')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisonApiF... Remove this comment to see the full error message
const { prisonApiFactory } = require('../api/prisonApi')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisonApi'... Remove this comment to see the full error message
const prisonApi = prisonApiFactory(null)
const externalEvents = require('../shared/getExternalEventsForOffenders')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'switchDate... Remove this comment to see the full error message
const { switchDateFormat } = require('../utils')

function createSentenceDataResponse() {
  return [
    {
      offenderNo: 'A1234AA',
      sentenceDetail: {
        releaseDate: switchDateFormat(moment()),
      },
    },
  ]
}
function createCourtEventResponse() {
  return [
    {
      event: '19',
      eventDescription: 'Court Appearance - Police Product Order',
      eventId: 349360018,
      eventStatus: 'SCH',
      eventType: 'COURT',
      firstName: 'BYSJANHKUMAR',
      lastName: 'HENRINEE',
      offenderNo: 'A1234AA',
      startTime: '2018-09-05T15:00:00',
    },
  ]
}

function createTransfersResponse() {
  return [
    {
      firstName: 'BYSJANHKUMAR',
      lastName: 'HENRINEE',
      offenderNo: 'A1234AA',
      startTime: switchDateFormat(moment()),
    },
  ]
}

function createAllTransferTypes() {
  return [
    {
      firstName: 'BYSJANHKUMAR',
      lastName: 'HENRINEE',
      offenderNo: 'A1234AA',
      startTime: switchDateFormat(moment()),
      eventStatus: 'SCH',
    },
    {
      firstName: 'BYSJANHKUMAR',
      lastName: 'HENRINEE',
      offenderNo: 'A1234AA',
      startTime: switchDateFormat(moment()),
      eventStatus: 'EXP',
    },
    {
      firstName: 'BYSJANHKUMAR',
      lastName: 'HENRINEE',
      offenderNo: 'A1234AA',
      startTime: switchDateFormat(moment()),
      eventStatus: 'CANC',
    },
    {
      firstName: 'BYSJANHKUMAR',
      lastName: 'HENRINEE',
      offenderNo: 'A1234AA',
      startTime: switchDateFormat(moment()),
      eventStatus: 'COMP',
    },
  ]
}

function createAlertsResponse() {
  return [
    {
      alertId: 42,
      bookingId: 1234,
      offenderNo: 'A1234AA',
      alertType: 'H',
      alertTypeDescription: 'Self Harm',
      alertCode: 'HA',
      alertCodeDescription: 'ACCT Open (HMPS)',
      comment: 'qePqeP',
      dateCreated: '2016-07-27',
      expired: false,
      active: true,
    },
    {
      alertId: 8,
      bookingId: 1234,
      offenderNo: 'A1234AA',
      alertType: 'X',
      alertTypeDescription: 'Security',
      alertCode: 'XEL',
      alertCodeDescription: 'Escape List',
      dateCreated: '2015-02-16',
      expired: false,
      active: true,
    },
    {
      alertId: 2,
      bookingId: 1234,
      offenderNo: 'A1234AA',
      alertType: 'X',
      alertTypeDescription: 'Security',
      alertCode: 'XEL',
      alertCodeDescription: 'Escape List',
      comment: 'THIS ALERT HAS EXPIRED SO IS IGNORED',
      dateCreated: '2015-02-16',
      dateExpires: '2015-04-04',
      expired: true,
      active: false,
    },
  ]
}

function createAssessmentsResponse() {
  return [
    {
      bookingId: 1234,
      offenderNo: 'A1234AA',
      classificationCode: 'A',
      classification: 'Cat A',
      assessmentCode: 'CATEGORY',
      assessmentDescription: 'Categorisation',
      cellSharingAlertFlag: false,
      assessmentDate: '2016-12-27',
      nextReviewDate: '2017-06-25',
    },
    {
      bookingId: 466,
      offenderNo: 'ABCDEEE',
      assessmentCode: 'CATEGORY',
      assessmentDescription: 'Categorisation',
      cellSharingAlertFlag: false,
      assessmentDate: '2016-12-27',
      nextReviewDate: '2017-06-25',
    },
  ]
}

describe('External events', () => {
  const offenderWithData = 'A1234AA'
  const offenderWithNoData = 'ABCDEEE'

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSentenceData' does not exist on type ... Remove this comment to see the full error message
    prisonApi.getSentenceData = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
    prisonApi.getCourtEvents = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
    prisonApi.getExternalTransfers = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlerts' does not exist on type '{}'.
    prisonApi.getAlerts = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
    prisonApi.getAssessments = jest.fn()
  })

  it('should handle empty offender numbers', async () => {
    const context = {}
    const response = await externalEvents(prisonApi, context, {})
    expect(response).toEqual([])
  })

  it('should deal with empty responses', async () => {
    const today = moment()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSentenceData' does not exist on type ... Remove this comment to see the full error message
    prisonApi.getSentenceData.mockImplementationOnce(() => null)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
    prisonApi.getCourtEvents.mockImplementationOnce(() => [])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
    prisonApi.getExternalTransfers.mockImplementationOnce(() => undefined)

    const response = await externalEvents(
      prisonApi,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
        formattedDate: switchDateFormat(today),
      }
    )

    expect(response.get(offenderWithData).releaseScheduled).toBe(false)
    expect(response.get(offenderWithData).courtEvents.length).toBe(0)
    expect(response.get(offenderWithData).scheduledTransfers.length).toBe(0)
    expect(response.get(offenderWithData).alertFlags.length).toBe(0)
    expect(response.get(offenderWithData).category).toEqual('')

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
    expect(prisonApi.getCourtEvents.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
    expect(prisonApi.getExternalTransfers.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSentenceData' does not exist on type ... Remove this comment to see the full error message
    expect(prisonApi.getSentenceData.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlerts' does not exist on type '{}'.
    expect(prisonApi.getAlerts.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
    expect(prisonApi.getAssessments.mock.calls.length).toBe(1)
  })

  it('should call getSentenceData with the correct parameters', async () => {
    const today = moment()
    await externalEvents(
      prisonApi,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
        formattedDate: switchDateFormat(today),
      }
    )
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSentenceData' does not exist on type ... Remove this comment to see the full error message
    expect(prisonApi.getSentenceData).toHaveBeenCalledWith({}, [offenderWithData, offenderWithNoData])
  })

  it('should call getCourtEvents with the correct parameters', async () => {
    const today = moment()
    await externalEvents(
      prisonApi,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
        formattedDate: switchDateFormat(today),
      }
    )
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
    expect(prisonApi.getCourtEvents).toHaveBeenCalledWith(
      {},
      {
        agencyId: 'LEI',
        date: switchDateFormat(today),
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
  })

  it('should call getExternalTransfers with the correct parameters', async () => {
    const today = moment()
    await externalEvents(
      prisonApi,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
        formattedDate: switchDateFormat(today),
      }
    )
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
    expect(prisonApi.getExternalTransfers).toHaveBeenCalledWith(
      {},
      {
        agencyId: 'LEI',
        date: switchDateFormat(today),
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
  })

  it('should call getAlerts with the correct parameters', async () => {
    await externalEvents(
      prisonApi,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlerts' does not exist on type '{}'.
    expect(prisonApi.getAlerts).toHaveBeenCalledWith(
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
  })

  it('should call getAssessments with the correct parameters', async () => {
    await externalEvents(
      prisonApi,
      {},
      {
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
    expect(prisonApi.getAssessments).toHaveBeenCalledWith(
      {},
      {
        code: 'CATEGORY',
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
  })

  it('should extend the offender data with additional call data', async () => {
    const today = moment()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSentenceData' does not exist on type ... Remove this comment to see the full error message
    prisonApi.getSentenceData.mockImplementationOnce(createSentenceDataResponse)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
    prisonApi.getCourtEvents.mockImplementationOnce(createCourtEventResponse)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
    prisonApi.getExternalTransfers.mockImplementationOnce(createTransfersResponse)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlerts' does not exist on type '{}'.
    prisonApi.getAlerts.mockImplementationOnce(createAlertsResponse)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
    prisonApi.getAssessments.mockImplementationOnce(createAssessmentsResponse)

    const response = await externalEvents(
      prisonApi,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
        formattedDate: switchDateFormat(today),
      }
    )

    expect(response.get(offenderWithData).releaseScheduled).toBe(true)
    expect(response.get(offenderWithData).courtEvents.length).toBe(1)
    expect(response.get(offenderWithData).scheduledTransfers.length).toBe(1)
    expect(response.get(offenderWithData).alertFlags).toEqual(['HA', 'XEL'])
    expect(response.get(offenderWithData).category).toBe('A')

    expect(response.get(offenderWithNoData).releaseScheduled).toBe(false)
    expect(response.get(offenderWithNoData).courtEvents.length).toBe(0)
    expect(response.get(offenderWithNoData).scheduledTransfers.length).toBe(0)
    expect(response.get(offenderWithNoData).alertFlags.length).toBe(0)
    expect(response.get(offenderWithNoData).category).not.toBeDefined()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
    expect(prisonApi.getCourtEvents.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
    expect(prisonApi.getExternalTransfers.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSentenceData' does not exist on type ... Remove this comment to see the full error message
    expect(prisonApi.getSentenceData.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlerts' does not exist on type '{}'.
    expect(prisonApi.getAlerts.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAssessments' does not exist on type '... Remove this comment to see the full error message
    expect(prisonApi.getAssessments.mock.calls.length).toBe(1)
  })

  it('should return multiple scheduled transfers along with status descriptions', async () => {
    const today = moment()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
    prisonApi.getExternalTransfers.mockImplementationOnce(() => createAllTransferTypes())

    const response = await externalEvents(
      prisonApi,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
        formattedDate: switchDateFormat(today),
      }
    )

    expect(response.get(offenderWithData).scheduledTransfers).toEqual([
      {
        eventDescription: 'Transfer scheduled',
        scheduled: true,
      },
      {
        eventDescription: 'Transfer scheduled',
        expired: true,
      },
      {
        eventDescription: 'Transfer scheduled',
        cancelled: true,
      },
      {
        eventDescription: 'Transfer scheduled',
        complete: true,
      },
    ])
  })

  it('should show the latest completed court event when there are more than one', async () => {
    const today = moment()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
    prisonApi.getCourtEvents.mockImplementationOnce(() => [
      {
        eventId: 1,
        eventStatus: 'COMP',
        eventType: 'COURT',
        offenderNo: offenderWithData,
        startTime: '2018-09-05T17:00:00',
      },
      {
        eventId: 2,
        eventStatus: 'COMP',
        eventType: 'COURT',
        offenderNo: offenderWithData,
        startTime: '2018-09-05T15:00:00',
      },
      {
        eventId: 3,
        eventStatus: 'SCH',
        eventType: 'COURT',
        offenderNo: offenderWithData,
        startTime: '2018-09-05T17:00:00',
      },
      {
        eventId: 4,
        eventStatus: 'EXP',
        eventType: 'COURT',
        offenderNo: offenderWithData,
        startTime: '2018-09-05T15:00:00',
      },
    ])

    const response = await externalEvents(
      prisonApi,
      {},
      { agencyId: 'LEI', offenderNumbers: [offenderWithData], formattedDate: switchDateFormat(today) }
    )

    expect(response.get(offenderWithData).courtEvents).toEqual([
      { eventDescription: 'Court visit scheduled', eventId: 3, scheduled: true },
      { eventDescription: 'Court visit scheduled', eventId: 4, expired: true },
      { eventDescription: 'Court visit scheduled', eventId: 1, complete: true },
    ])
  })

  describe('when the search date is in the future', () => {
    const thisTimeTomorrow = switchDateFormat(moment().add(1, 'day'))

    it('should not return scheduled transfers', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
      prisonApi.getExternalTransfers.mockReturnValueOnce([
        {
          eventId: 1,
          firstName: 'OFFENDER',
          lastName: 'ONE',
          offenderNo: 'A1234AA',
          startTime: thisTimeTomorrow,
        },
      ])

      const response = await externalEvents(
        prisonApi,
        {},
        {
          agencyId: 'LEI',
          offenderNumbers: [offenderWithData],
          formattedDate: thisTimeTomorrow,
        }
      )

      expect(response.get(offenderWithData).scheduledTransfers.length).toBe(0)
    })

    it('should not return scheduled court visits', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
      prisonApi.getCourtEvents.mockReturnValueOnce([
        {
          eventId: 1,
          eventDescription: 'Court Appearance - Police Product Order',
          eventStatus: 'SCH',
          eventType: 'COURT',
          firstName: 'TEST',
          lastName: 'OFFENDER',
          offenderNo: 'A1234AA',
          startTime: thisTimeTomorrow,
        },
      ])

      const response = await externalEvents(
        prisonApi,
        {},
        {
          agencyId: 'LEI',
          offenderNumbers: [offenderWithData],
          formattedDate: thisTimeTomorrow,
        }
      )

      expect(response.get(offenderWithData).courtEvents.length).toBe(0)
    })

    it('should not return release dates', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getSentenceData' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getSentenceData.mockReturnValueOnce([
        {
          offenderNo: 'A1234AA',
          sentenceDetail: {
            releaseDate: thisTimeTomorrow,
          },
        },
      ])

      const response = await externalEvents(
        prisonApi,
        {},
        {
          agencyId: 'LEI',
          offenderNumbers: [offenderWithData],
          formattedDate: thisTimeTomorrow,
        }
      )

      expect(response.get(offenderWithData).releaseScheduled).toBe(false)
    })
  })
})
