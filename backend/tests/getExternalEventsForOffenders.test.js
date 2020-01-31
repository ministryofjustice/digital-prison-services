const moment = require('moment')
const { elite2ApiFactory } = require('../api/elite2Api')

const elite2Api = elite2ApiFactory(null)
const externalEvents = require('../shared/getExternalEventsForOffenders')
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
    elite2Api.getSentenceData = jest.fn()
    elite2Api.getCourtEvents = jest.fn()
    elite2Api.getExternalTransfers = jest.fn()
    elite2Api.getAlerts = jest.fn()
    elite2Api.getAssessments = jest.fn()
  })

  it('should handle empty offender numbers', async () => {
    const context = {}
    const response = await externalEvents(elite2Api, context, {})
    expect(response).toEqual([])
  })

  it('should deal with empty responses', async () => {
    const today = moment()

    elite2Api.getSentenceData.mockImplementationOnce(() => null)
    elite2Api.getCourtEvents.mockImplementationOnce(() => [])
    elite2Api.getExternalTransfers.mockImplementationOnce(() => undefined)

    const response = await externalEvents(
      elite2Api,
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

    expect(elite2Api.getCourtEvents.mock.calls.length).toBe(1)
    expect(elite2Api.getExternalTransfers.mock.calls.length).toBe(1)
    expect(elite2Api.getSentenceData.mock.calls.length).toBe(1)
    expect(elite2Api.getAlerts.mock.calls.length).toBe(1)
    expect(elite2Api.getAssessments.mock.calls.length).toBe(1)
  })

  it('should call getSentenceData with the correct parameters', async () => {
    const today = moment()
    await externalEvents(
      elite2Api,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
        formattedDate: switchDateFormat(today),
      }
    )
    expect(elite2Api.getSentenceData).toHaveBeenCalledWith({}, [offenderWithData, offenderWithNoData])
  })

  it('should call getCourtEvents with the correct parameters', async () => {
    const today = moment()
    await externalEvents(
      elite2Api,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
        formattedDate: switchDateFormat(today),
      }
    )
    expect(elite2Api.getCourtEvents).toHaveBeenCalledWith(
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
      elite2Api,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
        formattedDate: switchDateFormat(today),
      }
    )
    expect(elite2Api.getExternalTransfers).toHaveBeenCalledWith(
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
      elite2Api,
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
    expect(elite2Api.getAlerts).toHaveBeenCalledWith(
      {},
      {
        agencyId: 'LEI',
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
  })

  it('should call getAssessments with the correct parameters', async () => {
    await externalEvents(
      elite2Api,
      {},
      {
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
    expect(elite2Api.getAssessments).toHaveBeenCalledWith(
      {},
      {
        code: 'CATEGORY',
        offenderNumbers: [offenderWithData, offenderWithNoData],
      }
    )
  })

  it('should extend the offender data with additional call data', async () => {
    const today = moment()

    elite2Api.getSentenceData.mockImplementationOnce(createSentenceDataResponse)
    elite2Api.getCourtEvents.mockImplementationOnce(createCourtEventResponse)
    elite2Api.getExternalTransfers.mockImplementationOnce(createTransfersResponse)
    elite2Api.getAlerts.mockImplementationOnce(createAlertsResponse)
    elite2Api.getAssessments.mockImplementationOnce(createAssessmentsResponse)

    const response = await externalEvents(
      elite2Api,
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

    expect(elite2Api.getCourtEvents.mock.calls.length).toBe(1)
    expect(elite2Api.getExternalTransfers.mock.calls.length).toBe(1)
    expect(elite2Api.getSentenceData.mock.calls.length).toBe(1)
    expect(elite2Api.getAlerts.mock.calls.length).toBe(1)
    expect(elite2Api.getAssessments.mock.calls.length).toBe(1)
  })

  it('should return multiple scheduled transfers along with status descriptions', async () => {
    const today = moment()

    elite2Api.getExternalTransfers.mockImplementationOnce(() => createAllTransferTypes())

    const response = await externalEvents(
      elite2Api,
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

    elite2Api.getCourtEvents.mockImplementationOnce(() => [
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
      elite2Api,
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
      elite2Api.getExternalTransfers.mockReturnValueOnce([
        {
          eventId: 1,
          firstName: 'OFFENDER',
          lastName: 'ONE',
          offenderNo: 'A1234AA',
          startTime: thisTimeTomorrow,
        },
      ])

      const response = await externalEvents(
        elite2Api,
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
      elite2Api.getCourtEvents.mockReturnValueOnce([
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
        elite2Api,
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
      elite2Api.getSentenceData.mockReturnValueOnce([
        {
          offenderNo: 'A1234AA',
          sentenceDetail: {
            releaseDate: thisTimeTomorrow,
          },
        },
      ])

      const response = await externalEvents(
        elite2Api,
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
