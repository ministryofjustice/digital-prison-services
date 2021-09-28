import moment from 'moment'
import { prisonApiFactory } from '../api/prisonApi'
import { getHouseblockListFactory as factory } from '../controllers/attendance/houseblockList'

import { distinct, switchDateFormat } from '../utils'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const prisonApi = prisonApiFactory(null)
const whereaboutsApi = {}
const config = {
  app: {
    production: true,
  },
}
const houseblockList = require('../controllers/attendance/houseblockList').getHouseblockListFactory(
  prisonApi,
  whereaboutsApi,
  config
).getHouseblockList

// There can be more than one occupant of a cell, the results are ordered by cell,offenderNo or cell,surname from the api.
function createResponse() {
  return [
    {
      bookingId: 1,
      eventId: 10,
      eventLocationId: 100,
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      cellLocation: 'LEI-A-1-1',
      event: 'CHAP',
      eventType: 'PRISON_ACT',
      eventDescription: 'Chapel',
      comment: 'comment11',
      endTime: '2017-10-15T18:30:00',
    },
    {
      bookingId: 2,
      eventId: 20,
      eventLocationId: 200,
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      cellLocation: 'LEI-A-1-1',
      event: 'VISIT',
      eventType: 'VISIT',
      eventDescription: 'Official Visit',
      comment: 'comment18',
      startTime: '2017-10-15T19:00:00',
      endTime: '2017-10-15T20:30:00',
    },
    {
      bookingId: 3,
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      cellLocation: 'LEI-A-1-1',
      event: 'CHAP',
      eventType: 'PRISON_ACT',
      eventDescription: 'Earliest paid activity',
      payRate: 1.3,
      comment: 'commentEarliest',
      startTime: '2017-10-15T17:30:00',
      endTime: '2017-10-15T18:30:00',
    },
    {
      bookingId: 4,
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      cellLocation: 'LEI-A-1-1',
      event: 'GYM',
      eventType: 'APP',
      eventDescription: 'The gym, appointment',
      comment: 'comment14',
      startTime: '2017-10-15T17:00:00',
      endTime: '2017-10-15T17:30:00',
    },
    {
      bookingId: 5,
      offenderNo: 'A1234AB',
      firstName: 'MICHAEL',
      lastName: 'SMITH',
      cellLocation: 'LEI-A-1-1',
      event: 'CHAP',
      eventType: 'PRISON_ACT',
      eventDescription: 'Chapel',
      comment: 'comment12',
      startTime: '2017-10-15T18:00:00',
      endTime: '2017-10-15T18:30:00',
    },
    {
      bookingId: 6,
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      cellLocation: 'LEI-A-1-3',
      event: 'CHAP',
      eventType: 'PRISON_ACT',
      payRate: 1.3,
      eventDescription: 'Chapel Activity',
      comment: 'comment13',
      startTime: '2017-10-15T18:00:00',
      endTime: '2017-10-15T18:30:00',
    },
    {
      bookingId: 7,
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      cellLocation: 'LEI-A-1-3',
      event: 'VISIT',
      eventType: 'VISIT',
      eventDescription: 'Family Visit',
      comment: 'comment19',
      startTime: '2017-10-15T18:00:00',
      endTime: '2017-10-15T18:30:00',
    },
    {
      bookingId: 8,
      offenderNo: 'A1234AD',
      firstName: 'ONLY',
      lastName: 'Visits',
      cellLocation: 'LEI-A-1-7',
      event: 'VISIT',
      eventType: 'VISIT',
      eventDescription: 'Family Visit',
      comment: 'only unpaid visit',
      startTime: '2017-10-15T18:00:00',
      endTime: '2017-10-15T18:30:00',
    },
  ]
}

function createMultipleActivities() {
  return [
    {
      offenderNo: 'A1234AA',
      eventType: 'PRISON_ACT',
      eventDescription: 'paid later',
      startTime: '2017-10-15T09:00:00',
      payRate: 0.5,
    },
    {
      offenderNo: 'A1234AA',
      eventType: 'PRISON_ACT',
      eventDescription: 'unpaid early',
      startTime: '2017-10-15T08:00:00',
    },
    {
      offenderNo: 'A1234AA',
      eventType: 'PRISON_ACT',
      eventDescription: 'paid early',
      startTime: '2017-10-15T08:30:00',
      payRate: 0.5,
    },
  ]
}

function createMultipleUnpaid() {
  return [
    {
      offenderNo: 'A1234AA',
      eventType: 'PRISON_ACT',
      eventDescription: 'unpaid later',
      startTime: '2017-10-15T09:00:00',
    },
    {
      offenderNo: 'A1234AA',
      eventType: 'PRISON_ACT',
      eventDescription: 'unpaid early',
      startTime: '2017-10-15T08:00:00',
    },
    {
      offenderNo: 'A1234AA',
      eventType: 'PRISON_ACT',
      eventDescription: 'unpaid middle',
      startTime: '2017-10-15T08:30:00',
    },
  ]
}

describe('Houseblock list controller', () => {
  beforeEach(() => {
    prisonApi.getHouseblockList = jest.fn()
    prisonApi.getSentenceData = jest.fn()
    prisonApi.getExternalTransfers = jest.fn()
    prisonApi.getCourtEvents = jest.fn()
    prisonApi.getAlerts = jest.fn()
    prisonApi.getAssessments = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAbsenceReasons' does not exist on typ... Remove this comment to see the full error message
    whereaboutsApi.getAbsenceReasons = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceForBookings' does not exist... Remove this comment to see the full error message
    whereaboutsApi.getAttendanceForBookings = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceForBookings' does not exist... Remove this comment to see the full error message
    whereaboutsApi.getAttendanceForBookings.mockReturnValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAbsenceReasons' does not exist on typ... Remove this comment to see the full error message
    whereaboutsApi.getAbsenceReasons.mockReturnValue({
      triggersIEPWarning: ['UnacceptableAbsence', 'Refused'],
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocations' does not exist ... Remove this comment to see the full error message
    whereaboutsApi.getAgencyGroupLocations = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocations' does not exist ... Remove this comment to see the full error message
    whereaboutsApi.getAgencyGroupLocations.mockReturnValue([{ locationId: 1 }])
  })

  it('Should add visit and appointment details to array', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    prisonApi.getHouseblockList.mockImplementationOnce(() => createResponse())

    const response = await houseblockList({})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocations' does not exist ... Remove this comment to see the full error message
    expect(whereaboutsApi.getAgencyGroupLocations.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(context: ... Remove this comment to see the full error message
    expect(prisonApi.getHouseblockList.mock.calls.length).toBe(1)

    expect(response.length).toBe(4)

    expect(response[0].activities[0].offenderNo).toBe('A1234AA')
    expect(response[0].activities[0].firstName).toBe('ARTHUR')
    expect(response[0].activities[0].lastName).toBe('ANDERSON')
    expect(response[0].activities[0].cellLocation).toBe('LEI-A-1-1')
    expect(response[0].activities[0].event).toBe('CHAP')
    expect(response[0].activities[0].eventType).toBe('PRISON_ACT')
    expect(response[0].activities[0].eventDescription).toBe('Earliest paid activity')
    expect(response[0].activities[0].comment).toBe('commentEarliest')
    expect(response[0].activities[0].startTime).toBe('2017-10-15T17:30:00')
    expect(response[0].activities[0].endTime).toBe('2017-10-15T18:30:00')
    expect(response[0].activities[0].mainActivity).toBe(true)

    expect(response[0].activities.length).toBe(4)
    expect(response[0].activities[1].offenderNo).toBe('A1234AA')
    expect(response[0].activities[1].firstName).toBe('ARTHUR')
    expect(response[0].activities[1].lastName).toBe('ANDERSON')
    expect(response[0].activities[1].cellLocation).toBe('LEI-A-1-1')
    expect(response[0].activities[1].event).toBe('VISIT')
    expect(response[0].activities[1].eventDescription).toBe('Official Visit')
    expect(response[0].activities[1].comment).toBe('comment18')
    expect(response[0].activities[1].startTime).toBe('2017-10-15T19:00:00')
    expect(response[0].activities[1].endTime).toBe('2017-10-15T20:30:00')

    expect(response[0].activities[2].offenderNo).toBe('A1234AA')
    expect(response[0].activities[2].firstName).toBe('ARTHUR')
    expect(response[0].activities[2].lastName).toBe('ANDERSON')
    expect(response[0].activities[2].cellLocation).toBe('LEI-A-1-1')
    expect(response[0].activities[2].event).toBe('CHAP')
    expect(response[0].activities[2].eventDescription).toBe('Chapel')
    expect(response[0].activities[2].comment).toBe('comment11')
    expect(response[0].activities[2].startTime).toBeUndefined()
    expect(response[0].activities[2].endTime).toBe('2017-10-15T18:30:00')

    expect(response[0].activities[3].offenderNo).toBe('A1234AA')
    expect(response[0].activities[3].firstName).toBe('ARTHUR')
    expect(response[0].activities[3].lastName).toBe('ANDERSON')
    expect(response[0].activities[3].cellLocation).toBe('LEI-A-1-1')
    expect(response[0].activities[3].event).toBe('GYM')
    expect(response[0].activities[3].eventDescription).toBe('The gym, appointment')
    expect(response[0].activities[3].comment).toBe('comment14')
    expect(response[0].activities[3].startTime).toBe('2017-10-15T17:00:00')
    expect(response[0].activities[3].endTime).toBe('2017-10-15T17:30:00')
  })

  it('Should pass location Ids to getHouseblockList', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocations' does not exist ... Remove this comment to see the full error message
    whereaboutsApi.getAgencyGroupLocations.mockReturnValue([{ locationId: 1 }, { locationId: 2 }])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    prisonApi.getHouseblockList.mockImplementationOnce(() => createResponse())

    await houseblockList({})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocations' does not exist ... Remove this comment to see the full error message
    expect(whereaboutsApi.getAgencyGroupLocations.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(context: ... Remove this comment to see the full error message
    expect(prisonApi.getHouseblockList.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(context: ... Remove this comment to see the full error message
    expect(prisonApi.getHouseblockList.mock.calls[0][2]).toStrictEqual([1, 2])
  })

  it('Should not retrieve houseblock list if no cell locations in wing', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocations' does not exist ... Remove this comment to see the full error message
    whereaboutsApi.getAgencyGroupLocations = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocations' does not exist ... Remove this comment to see the full error message
    whereaboutsApi.getAgencyGroupLocations.mockReturnValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    prisonApi.getHouseblockList.mockImplementationOnce(() => createResponse())

    const response = await houseblockList({})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyGroupLocations' does not exist ... Remove this comment to see the full error message
    expect(whereaboutsApi.getAgencyGroupLocations.mock.calls.length).toBe(1)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(context: ... Remove this comment to see the full error message
    expect(prisonApi.getHouseblockList.mock.calls.length).toBe(0)
    expect(response).toStrictEqual([])
  })

  it('Should correctly choose main activity', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    prisonApi.getHouseblockList.mockImplementationOnce(() => createMultipleActivities())

    const response = await houseblockList({})

    expect(response.length).toBe(1)

    expect(response[0].activities[0].eventDescription).toBe('paid early')
    expect(response[0].activities[0].startTime).toBe('2017-10-15T08:30:00')
    expect(response[0].activities[0].mainActivity).toBe(true)

    expect(response[0].activities.length).toBe(3)
    expect(response[0].activities[1].eventDescription).toBe('unpaid early')
    expect(response[0].activities[1].startTime).toBe('2017-10-15T08:00:00')
    expect(response[0].activities[2].eventDescription).toBe('paid later')
    expect(response[0].activities[2].startTime).toBe('2017-10-15T09:00:00')
  })

  it('Should correctly choose between multiple unpaid', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    prisonApi.getHouseblockList.mockImplementationOnce(() => createMultipleUnpaid())

    const response = await houseblockList({})

    expect(response.length).toBe(1)

    expect(response[0].activities[0].eventDescription).toBe('unpaid early')
    expect(response[0].activities[0].startTime).toBe('2017-10-15T08:00:00')

    expect(response[0].activities.length).toBe(3)
    expect(response[0].activities[1].eventDescription).toBe('unpaid later')
    expect(response[0].activities[1].startTime).toBe('2017-10-15T09:00:00')
    expect(response[0].activities[2].eventDescription).toBe('unpaid middle')
    expect(response[0].activities[2].startTime).toBe('2017-10-15T08:30:00')
  })

  it('Should handle no response data', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    prisonApi.getHouseblockList.mockImplementationOnce(() => [])

    const response = await houseblockList({})

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(context: ... Remove this comment to see the full error message
    expect(prisonApi.getHouseblockList.mock.calls.length).toBe(1)
    expect(response.length).toBe(0)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(context: ... Remove this comment to see the full error message
    expect(prisonApi.getSentenceData.mock.calls.length).toBe(0)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(context: ... Remove this comment to see the full error message
    expect(prisonApi.getCourtEvents.mock.calls.length).toBe(0)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mock' does not exist on type '(context: ... Remove this comment to see the full error message
    expect(prisonApi.getExternalTransfers.mock.calls.length).toBe(0)
  })

  it('should fetch sentence data for all offenders in a house block', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    prisonApi.getHouseblockList.mockImplementationOnce(() => createMultipleUnpaid())

    await houseblockList({})

    const offenderNumbers = createMultipleUnpaid().map((e) => e.offenderNo)

    expect(prisonApi.getSentenceData).toHaveBeenCalledWith({}, distinct(offenderNumbers))
  })

  it('should return multiple scheduled transfers along with status descriptions', async () => {
    const today = moment()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    prisonApi.getHouseblockList.mockImplementationOnce(() => createMultipleUnpaid())

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
    prisonApi.getExternalTransfers.mockImplementationOnce(() => [
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
    ])

    const response = await houseblockList({}, 'LEI', 'GROUP1', today, 'AM')

    expect(response[0].scheduledTransfers).toEqual([
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

  describe('Attendance information', () => {
    it('should call getAttendance with correct parameters', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
      prisonApi.getHouseblockList.mockImplementationOnce(() => createResponse())

      await houseblockList({}, 'LEI', 'Houseblock 1', '15/10/2017', 'PM')

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceForBookings' does not exist... Remove this comment to see the full error message
      expect(whereaboutsApi.getAttendanceForBookings).toHaveBeenCalledWith(
        {},
        { agencyId: 'LEI', period: 'PM', bookings: [1, 2, 3, 4, 5, 6, 7, 8], date: '2017-10-15' }
      )
    })

    it('should load attendance details for a list of booking ids', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
      prisonApi.getHouseblockList.mockImplementationOnce(() => [
        {
          bookingId: 1,
          eventId: 10,
          eventLocationId: 100,
          offenderNo: 'A1234AA',
          firstName: 'ARTHUR',
          lastName: 'ANDERSON',
          cellLocation: 'LEI-A-1-1',
          event: 'CHAP',
          eventType: 'PRISON_ACT',
          eventDescription: 'Chapel',
          comment: 'comment1',
          endTime: '2017-10-15T18:30:00',
        },
        {
          bookingId: 2,
          eventId: 20,
          eventLocationId: 200,
          offenderNo: 'A1234AB',
          firstName: 'MICHAEL',
          lastName: 'SMITH',
          cellLocation: 'LEI-A-1-1',
          event: 'CHAP',
          eventType: 'PRISON_ACT',
          eventDescription: 'Chapel',
          comment: 'comment12',
          startTime: '2017-10-15T18:00:00',
          endTime: '2017-10-15T18:30:00',
        },
        {
          bookingId: 2,
          eventId: 30,
          eventLocationId: 200,
          offenderNo: 'A1234AB',
          firstName: 'MICHAEL',
          lastName: 'SMITH',
          cellLocation: 'LEI-A-1-1',
          event: 'CHAP',
          eventType: 'PRISON_ACT',
          eventDescription: 'Chapel',
          comment: 'comment12',
          startTime: '2017-10-15T18:00:00',
          endTime: '2017-10-15T18:30:00',
        },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceForBookings' does not exist... Remove this comment to see the full error message
      whereaboutsApi.getAttendanceForBookings.mockReturnValue({
        attendances: [
          {
            attended: true,
            bookingId: 1,
            caseNoteId: 0,
            createDateTime: '2019-07-08T07:57:12.358Z',
            createUserId: 'string',
            eventDate: 'string',
            eventId: 10,
            eventLocationId: 100,
            id: 1,
            locked: true,
            modifyDateTime: '2019-07-08T07:57:12.358Z',
            modifyUserId: 'string',
            paid: true,
            period: 'AM',
            prisonId: 'string',
          },
          {
            absentReason: 'AcceptableAbsence',
            attended: false,
            bookingId: 2,
            caseNoteId: 0,
            comments: 'string',
            createDateTime: '2019-07-08T07:57:12.358Z',
            createUserId: 'string',
            eventDate: 'string',
            eventId: 20,
            eventLocationId: 200,
            id: 2,
            locked: true,
            modifyDateTime: '2019-07-08T07:57:12.358Z',
            modifyUserId: 'string',
            paid: true,
            period: 'AM',
            prisonId: 'string',
          },
          {
            absentReason: 'UnacceptableAbsence',
            attended: false,
            bookingId: 2,
            caseNoteId: 0,
            comments: 'string',
            createDateTime: '2019-07-08T07:57:12.358Z',
            createUserId: 'string',
            eventDate: 'string',
            eventId: 30,
            eventLocationId: 200,
            id: 2,
            locked: true,
            modifyDateTime: '2019-07-08T07:57:12.358Z',
            modifyUserId: 'string',
            paid: false,
            period: 'AM',
            prisonId: 'string',
          },
        ],
      })

      const response = await houseblockList({}, 'LEI', 'Houseblock 1', '15/10/2017', 'PM')

      expect(response).toEqual([
        {
          activities: [
            {
              attendanceInfo: {
                absentReason: undefined,
                comments: undefined,
                id: 1,
                locked: true,
                paid: true,
                pay: true,
              },
              bookingId: 1,
              cellLocation: 'LEI-A-1-1',
              comment: 'comment1',
              endTime: '2017-10-15T18:30:00',
              event: 'CHAP',
              eventDescription: 'Chapel',
              eventId: 10,
              eventLocationId: 100,
              eventType: 'PRISON_ACT',
              firstName: 'ARTHUR',
              lastName: 'ANDERSON',
              mainActivity: true,
              offenderNo: 'A1234AA',
            },
          ],
          alertFlags: [],
          bookingId: 1,
          category: '',
          cellLocation: 'LEI-A-1-1',
          courtEvents: [],
          eventId: 10,
          eventLocationId: 100,
          firstName: 'ARTHUR',
          lastName: 'ANDERSON',
          offenderNo: 'A1234AA',
          releaseScheduled: false,
          scheduledTransfers: [],
          stayingOnWing: false,
        },
        {
          activities: [
            {
              attendanceInfo: {
                absentReason: {
                  value: 'AcceptableAbsence',
                  name: 'Acceptable',
                },
                comments: 'string',
                id: 2,
                locked: true,
                other: true,
                paid: true,
              },
              bookingId: 2,
              cellLocation: 'LEI-A-1-1',
              comment: 'comment12',
              endTime: '2017-10-15T18:30:00',
              event: 'CHAP',
              eventDescription: 'Chapel',
              eventId: 20,
              eventLocationId: 200,
              eventType: 'PRISON_ACT',
              firstName: 'MICHAEL',
              lastName: 'SMITH',
              mainActivity: true,
              offenderNo: 'A1234AB',
              startTime: '2017-10-15T18:00:00',
            },
            {
              attendanceInfo: {
                absentReason: {
                  value: 'UnacceptableAbsence',
                  name: 'Unacceptable - Incentive Level warning',
                },
                comments: 'string',
                id: 2,
                locked: true,
                other: true,
                paid: false,
              },
              bookingId: 2,
              cellLocation: 'LEI-A-1-1',
              comment: 'comment12',
              endTime: '2017-10-15T18:30:00',
              event: 'CHAP',
              eventDescription: 'Chapel',
              eventId: 30,
              eventLocationId: 200,
              eventType: 'PRISON_ACT',
              firstName: 'MICHAEL',
              lastName: 'SMITH',
              offenderNo: 'A1234AB',
              startTime: '2017-10-15T18:00:00',
            },
          ],
          alertFlags: [],
          bookingId: 2,
          category: '',
          cellLocation: 'LEI-A-1-1',
          courtEvents: [],
          eventId: 20,
          eventLocationId: 200,
          firstName: 'MICHAEL',
          lastName: 'SMITH',
          offenderNo: 'A1234AB',
          releaseScheduled: false,
          scheduledTransfers: [],
          stayingOnWing: false,
        },
      ])
    })

    it('should not call getAttendanceForBookings if there are no offenders', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
      prisonApi.getHouseblockList.mockImplementationOnce(() => [])
      await houseblockList({}, 'LEI', 'Houseblock 1', '15/10/2017', 'PM')

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceForBookings' does not exist... Remove this comment to see the full error message
      expect(whereaboutsApi.getAttendanceForBookings).not.toHaveBeenCalled()
    })

    it('should only request attendance for prison that have been enabled', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValue' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getHouseblockList.mockReturnValue([
        {
          bookingId: 1,
          eventId: 10,
          eventLocationId: 100,
          offenderNo: 'A1234AA',
          firstName: 'ARTHUR',
          lastName: 'ANDERSON',
          cellLocation: 'LEI-A-1-1',
          event: 'CHAP',
          eventType: 'PRISON_ACT',
          eventDescription: 'Chapel',
          comment: 'comment1',
          endTime: '2017-10-15T18:30:00',
        },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceForBookings' does not exist... Remove this comment to see the full error message
      whereaboutsApi.getAttendanceForBookings.mockReturnValue([])
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
      const { getHouseblockList: service } = factory(prisonApi, whereaboutsApi, {
        app: {
          production: true,
        },
      })

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 6 arguments, but got 5.
      await service({}, 'LEI', 'Houseblock 1', '15/10/2017', 'PM')
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 6 arguments, but got 5.
      await service({}, 'MDI', 'Houseblock 1', '15/10/2017', 'PM')

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAbsenceReasons' does not exist on typ... Remove this comment to see the full error message
      expect(whereaboutsApi.getAbsenceReasons.mock.calls.length).toBe(2)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceForBookings' does not exist... Remove this comment to see the full error message
      expect(whereaboutsApi.getAttendanceForBookings.mock.calls.length).toBe(2)
    })

    it('should enable attendance for everyone in dev', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockReturnValue' does not exist on type ... Remove this comment to see the full error message
      prisonApi.getHouseblockList.mockReturnValue([
        {
          bookingId: 1,
          eventId: 10,
          eventLocationId: 100,
          offenderNo: 'A1234AA',
          firstName: 'ARTHUR',
          lastName: 'ANDERSON',
          cellLocation: 'LEI-A-1-1',
          event: 'CHAP',
          eventType: 'PRISON_ACT',
          eventDescription: 'Chapel',
          comment: 'comment1',
          endTime: '2017-10-15T18:30:00',
        },
      ])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceForBookings' does not exist... Remove this comment to see the full error message
      whereaboutsApi.getAttendanceForBookings.mockReturnValue([])
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
      const { getHouseblockList: service } = factory(prisonApi, whereaboutsApi, {
        app: {
          production: false,
        },
      })

      // @ts-expect-error ts-migrate(2554) FIXME: Expected 6 arguments, but got 5.
      await service({}, 'LEI', 'Houseblock 1', '15/10/2017', 'PM')
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 6 arguments, but got 5.
      await service({}, 'MDI', 'Houseblock 1', '15/10/2017', 'PM')

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAbsenceReasons' does not exist on typ... Remove this comment to see the full error message
      expect(whereaboutsApi.getAbsenceReasons.mock.calls.length).toBe(2)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAttendanceForBookings' does not exist... Remove this comment to see the full error message
      expect(whereaboutsApi.getAttendanceForBookings.mock.calls.length).toBe(2)
    })
  })

  describe('Wing status', () => {
    const responseWithOneLeavingWing = [
      {
        bookingId: 1,
        eventId: 10,
        eventLocationId: 100,
        offenderNo: 'A1234AA',
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: 'LEI-A-1-1',
        event: 'CHAP',
        eventType: 'PRISON_ACT',
        eventDescription: 'Chapel Activity',
        comment: 'comment11',
        endTime: '2017-10-15T18:30:00',
        locationCode: 'ACTIVITYELSEWHERE',
      },
      {
        bookingId: 1,
        eventId: 20,
        eventLocationId: 200,
        offenderNo: 'A1234AA',
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: 'LEI-A-1-1',
        event: 'VISIT',
        eventType: 'VISIT',
        eventDescription: 'Official Visit',
        comment: 'comment18',
        startTime: '2017-10-15T19:00:00',
        endTime: '2017-10-15T20:30:00',
        locationCode: 'STAYONWING',
      },
      {
        bookingId: 2,
        offenderNo: 'A1234AB',
        firstName: 'MICHAEL',
        lastName: 'SMITH',
        cellLocation: 'LEI-A-1-1',
        event: 'CHAP',
        eventType: 'PRISON_ACT',
        eventDescription: 'Chapel Activity',
        comment: 'comment12',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
      },
      {
        bookingId: 3,
        offenderNo: 'A1234AC',
        firstName: 'FRED',
        lastName: 'QUIMBY',
        cellLocation: 'LEI-A-1-3',
        event: 'CHAP',
        eventType: 'PRISON_ACT',
        payRate: 1.3,
        eventDescription: 'Chapel Activity',
        comment: 'comment13',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        locationCode: 'UNEMPLOYED',
      },
      {
        bookingId: 4,
        offenderNo: 'A1234AD',
        firstName: 'STEVE',
        lastName: 'JONES',
        cellLocation: 'LEI-A-1-4',
        event: 'CHAP',
        eventType: 'PRISON_ACT',
        payRate: 1.3,
        eventDescription: 'Chapel Activity',
        comment: 'comment13',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        locationCode: 'STAYONWING',
      },
      {
        bookingId: 5,
        offenderNo: 'A1234AE',
        firstName: 'JOHN',
        lastName: 'SMITH',
        cellLocation: 'LEI-A-1-5',
        event: 'CHAP',
        eventType: 'PRISON_ACT',
        payRate: 1.3,
        eventDescription: 'Chapel Activity',
        comment: 'comment13',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        locationCode: 'RETIRED',
      },
      {
        bookingId: 6,
        offenderNo: 'A1234AF',
        firstName: 'JIM',
        lastName: 'BROWN',
        cellLocation: 'LEI-A-1-6',
        event: 'WORK',
        eventType: 'PRISON_ACT',
        payRate: 1.4,
        eventDescription: 'Do some work',
        comment: 'comment14',
        startTime: '2017-10-16T18:00:00',
        endTime: '2017-10-16T18:30:00',
        locationCode: 'IN_CELL',
      },
    ]

    it('should return only offenders leaving the wing', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
      prisonApi.getHouseblockList.mockImplementationOnce(() => responseWithOneLeavingWing)

      const response = await houseblockList({}, 'LEI', 'Houseblock 1', '15/10/2017', 'ED', 'leaving')

      expect(response.length).toEqual(2)
      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            bookingId: 1,
            firstName: 'ARTHUR',
            lastName: 'ANDERSON',
            offenderNo: 'A1234AA',
            stayingOnWing: false,
            activities: expect.arrayContaining([
              expect.objectContaining({
                bookingId: 1,
                firstName: 'ARTHUR',
                lastName: 'ANDERSON',
                offenderNo: 'A1234AA',
                event: 'CHAP',
                eventDescription: 'Chapel Activity',
                eventType: 'PRISON_ACT',
                mainActivity: true,
                locationCode: 'ACTIVITYELSEWHERE',
              }),
              expect.objectContaining({
                bookingId: 1,
                firstName: 'ARTHUR',
                lastName: 'ANDERSON',
                offenderNo: 'A1234AA',
                event: 'VISIT',
                eventDescription: 'Official Visit',
                eventType: 'VISIT',
                locationCode: 'STAYONWING',
              }),
            ]),
          }),
        ]),
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        expect.arrayContaining([
          expect.objectContaining({
            bookingId: 2,
            firstName: 'MICHAEL',
            lastName: 'SMITH',
            offenderNo: 'A1234AB',
            stayingOnWing: false,
            activities: [
              expect.objectContaining({
                bookingId: 2,
                firstName: 'MICHAEL',
                lastName: 'SMITH',
                offenderNo: 'A1234AB',
                event: 'CHAP',
                eventDescription: 'Chapel Activity',
                eventType: 'PRISON_ACT',
                mainActivity: true,
              }),
            ],
          }),
        ])
      )
    })

    it('should return only offenders staying on the wing', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockImplementationOnce' does not exist o... Remove this comment to see the full error message
      prisonApi.getHouseblockList.mockImplementationOnce(() => responseWithOneLeavingWing)

      const response = await houseblockList({}, 'LEI', 'Houseblock 1', '15/10/2017', 'ED', 'staying')

      expect(response.length).toEqual(4)
      expect(response).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            bookingId: 3,
            firstName: 'FRED',
            lastName: 'QUIMBY',
            offenderNo: 'A1234AC',
            stayingOnWing: true,
            activities: expect.arrayContaining([
              expect.objectContaining({
                bookingId: 3,
                firstName: 'FRED',
                lastName: 'QUIMBY',
                offenderNo: 'A1234AC',
                event: 'CHAP',
                eventDescription: 'Chapel Activity',
                eventType: 'PRISON_ACT',
                mainActivity: true,
                locationCode: 'UNEMPLOYED',
              }),
            ]),
          }),
        ]),
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 3.
        expect.arrayContaining([
          expect.objectContaining({
            bookingId: 4,
            firstName: 'STEVE',
            lastName: 'JONES',
            offenderNo: 'A1234AD',
            stayingOnWing: true,
            activities: expect.arrayContaining([
              expect.objectContaining({
                bookingId: 4,
                firstName: 'STEVE',
                lastName: 'JONES',
                offenderNo: 'A1234AD',
                event: 'CHAP',
                eventDescription: 'Chapel Activity',
                eventType: 'PRISON_ACT',
                mainActivity: true,
                locationCode: 'STAYONWING',
              }),
            ]),
          }),
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            bookingId: 5,
            firstName: 'JOHN',
            lastName: 'SMITH',
            offenderNo: 'A1234AE',
            stayingOnWing: true,
            activities: expect.arrayContaining([
              expect.objectContaining({
                bookingId: 5,
                firstName: 'JOHN',
                lastName: 'SMITH',
                offenderNo: 'A1234AE',
                event: 'CHAP',
                eventDescription: 'Chapel Activity',
                eventType: 'PRISON_ACT',
                mainActivity: true,
                locationCode: 'RETIRED',
              }),
            ]),
          }),
        ]),
        expect.arrayContaining([
          expect.objectContaining({
            bookingId: 6,
            firstName: 'JIM',
            lastName: 'BROWN',
            offenderNo: 'A1234AF',
            stayingOnWing: true,
            activities: expect.arrayContaining([
              expect.objectContaining({
                bookingId: 6,
                firstName: 'JIM',
                lastName: 'BROWN',
                offenderNo: 'A1234AF',
                event: 'WORK',
                eventDescription: 'Do some work',
                eventType: 'PRISON_ACT',
                mainActivity: true,
                locationCode: 'IN_CELL',
              }),
            ]),
          }),
        ])
      )
    })
  })
})
