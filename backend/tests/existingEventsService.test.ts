import moment from 'moment'
import { DATE_ONLY_FORMAT_SPEC } from '../../common/dateHelpers'
import existingEventsService from '../services/existingEventsService'
import { prisonApiFactory } from '../api/prisonApi'

describe('existing events', () => {
  const prisonApi: Partial<ReturnType<typeof prisonApiFactory>> & {
    getActivitiesAtLocation: jest.Mock
    getActivityList: jest.Mock
    getLocationsByNonResidentialUsageType: jest.Mock
    getSentenceData: jest.Mock
    getVisits: jest.Mock
    getAppointments: jest.Mock
    getExternalTransfers: jest.Mock
    getCourtEvents: jest.Mock
    getActivities: jest.Mock
  } = {
    getActivitiesAtLocation: jest.fn(),
    getActivityList: jest.fn(),
    getLocationsByNonResidentialUsageType: jest.fn(),
    getSentenceData: jest.fn(),
    getVisits: jest.fn(),
    getAppointments: jest.fn(),
    getExternalTransfers: jest.fn(),
    getCourtEvents: jest.fn(),
    getActivities: jest.fn(),
  }
  const systemToken = { system: 'system' }
  const getClientCredentialsTokens = jest.fn().mockResolvedValue(systemToken)

  let service

  beforeEach(() => {
    service = existingEventsService(getClientCredentialsTokens, prisonApi)
  })

  describe('location availability', () => {
    beforeEach(() => {
      prisonApi.getLocationsByNonResidentialUsageType.mockReturnValue(Promise.resolve([]))
    })

    it('should handle time slot where location booking slightly overlap ', async () => {
      const today = moment().format(DATE_ONLY_FORMAT_SPEC)
      const startTime = `${today}T09:00:00`
      const endTime = `${today}T13:00:00`

      const availableLocations = await service.getAvailableLocations(
        {},
        {
          agency: 'MDI',
          timeSlot: { startTime, endTime },
          locations: [
            { value: 1, text: 'Location 1' },
            { value: 2, text: 'Location 2' },
          ],
          eventsAtLocations: [
            {
              locationId: 1,
              start: `${today}T10:00:00`,
              end: `${today}T15:00:00`,
              eventDescription: 'Video booking for John',
            },
          ],
        }
      )
      expect(availableLocations).toEqual([{ value: 2, text: 'Location 2' }])
    })

    it('should handle a location being fully booked', async () => {
      const today = moment().format(DATE_ONLY_FORMAT_SPEC)
      const startTime = `${today}T09:00:00`
      const endTime = `${today}T13:00:00`

      const availableLocations = await service.getAvailableLocations(
        {},
        {
          agency: 'MDI',
          timeSlot: { startTime, endTime },
          locations: [
            { value: 1, text: 'Location 1' },
            { value: 2, text: 'Location 2' },
          ],
          eventsAtLocations: [
            {
              locationId: 1,
              start: `${today}T09:00:00`,
              end: `${today}T10:00:00`,
            },
            {
              locationId: 1,
              start: `${today}T10:00:00`,
              end: `${today}T11:00:00`,
            },
            {
              locationId: 1,
              start: `${today}T11:00:00`,
              end: `${today}T12:00:00`,
            },
            {
              locationId: 1,
              start: `${today}T12:00:00`,
              end: `${today}T13:00:00`,
            },
            {
              locationId: 1,
              start: `${today}T13:00:00`,
              end: `${today}T14:00:00`,
            },
            {
              locationId: 1,
              start: `${today}T14:00:00`,
              end: `${today}T15:00:00`,
            },
            {
              locationId: 1,
              start: `${today}T15:00:00`,
              end: `${today}T16:00:00`,
            },
            {
              locationId: 1,
              start: `${today}T16:00:00`,
              end: `${today}T17:00:00`,
            },
            {
              locationId: 1,
              start: `${today}T17:00:00`,
              end: `${today}T18:00:00`,
            },
          ],
        }
      )
      expect(availableLocations).toEqual([{ value: 2, text: 'Location 2' }])
    })

    it('should return all rooms as available', async () => {
      const today = moment().format(DATE_ONLY_FORMAT_SPEC)
      const startTime = `${today}T11:00:00`
      const endTime = `${today}T14:00:00`
      prisonApi.getActivityList.mockReturnValue(
        Promise.resolve([
          {
            locationId: 1,
            startTime: `${today}T17:00:00`,
            endTime: `${today}T18:00:00`,
            eventDescription: 'Video booking for John',
          },
        ])
      )

      const availableLocations = await service.getAvailableLocations(
        {},
        {
          agency: 'MDI',
          timeSlot: { startTime, endTime },
          locations: [
            { value: 1, text: 'Location 1' },
            { value: 2, text: 'Location 2' },
          ],
          eventsAtLocations: [
            {
              locationId: 1,
              start: `${today}T17:00:00`,
              end: `${today}T18:00:00`,
              eventDescription: 'Video booking for John',
            },
          ],
        }
      )
      expect(availableLocations).toEqual([
        { value: 1, text: 'Location 1' },
        { value: 2, text: 'Location 2' },
      ])
    })

    it('should make multiple calls to retrieve events at each location, also enhancing each event with the locationId', async () => {
      prisonApi.getActivityList.mockReturnValue(
        Promise.resolve([{ eventId: 1, startTime: '2010-10-10T10:00:00', endTime: '2010-10-10T10:00:00' }])
      )

      const date = '10/10/2019'
      const events = await service.getAppointmentsAtLocations(
        {},
        {
          date,
          agency: 'MDI',
          locations: [
            { value: 1, text: 'location 1' },
            { value: 2, text: 'location 2' },
          ],
        }
      )

      expect(events).toEqual(
        expect.objectContaining([
          {
            end: '2010-10-10T10:00:00',
            endTime: '10:00',
            eventDescription: ' undefined',
            eventId: 1,
            locationId: 1,
            start: '2010-10-10T10:00:00',
            startTime: '10:00',
          },
          {
            end: '2010-10-10T10:00:00',
            endTime: '10:00',
            eventDescription: ' undefined',
            eventId: 1,
            locationId: 2,
            start: '2010-10-10T10:00:00',
            startTime: '10:00',
          },
        ])
      )

      expect(prisonApi.getActivityList).toHaveBeenCalledWith(
        {},
        { agencyId: 'MDI', date: '2019-10-10', locationId: 1, usage: 'APP' }
      )
      expect(prisonApi.getActivityList).toHaveBeenCalledWith(
        {},
        { agencyId: 'MDI', date: '2019-10-10', locationId: 2, usage: 'APP' }
      )
    })
  })

  describe('getting events for offenders', () => {
    it('should call the correct endpoints with the correct parameters', async () => {
      const expectedParameters = {
        agencyId: 'LEI',
        date: '2019-12-11',
        offenderNumbers: ['ABC123'],
      }

      await service.getExistingEventsForOffender({}, 'LEI', '11/12/2019', 'ABC123')

      expect(prisonApi.getVisits).toHaveBeenCalledWith(systemToken, expectedParameters)
      expect(prisonApi.getAppointments).toHaveBeenCalledWith(systemToken, expectedParameters)
      expect(prisonApi.getExternalTransfers).toHaveBeenCalledWith(systemToken, expectedParameters)
      expect(prisonApi.getCourtEvents).toHaveBeenCalledWith(systemToken, expectedParameters)
      expect(prisonApi.getActivities).toHaveBeenCalledWith(systemToken, expectedParameters)
    })

    describe('when there are no errors', () => {
      beforeEach(() => {
        prisonApi.getSentenceData = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            firstName: 'Test',
            lastName: 'Offender',
            agencyLocationId: 'LEI',
            sentenceDetail: {
              releaseDate: '2019-12-11',
            },
          },
        ])
        prisonApi.getVisits = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 1,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'VISIT',
            eventDescription: 'Visit',
            eventLocation: 'Visiting room',
            comment: 'A comment.',
            startTime: '2019-12-11T14:00:00',
            endTime: '2019-12-11T15:00:00',
          },
        ])
        prisonApi.getAppointments = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 2,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'APPT',
            eventDescription: 'An appointment',
            eventLocation: 'Office 1',
            startTime: '2019-12-11T12:00:00',
            endTime: '2019-12-11T13:00:00',
          },
        ])
        prisonApi.getExternalTransfers = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 3,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'TRANS',
            eventDescription: 'Transfer',
            eventLocation: 'Somewhere else',
            comment: 'A comment.',
            startTime: '2019-12-11T16:00:00',
            endTime: '2019-12-11T17:00:00',
          },
        ])
        prisonApi.getCourtEvents = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            eventId: 4,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'CRT',
            eventType: 'COURT',
            eventDescription: 'Court Appearance',
            eventStatus: 'SCH',
            startTime: '2019-12-11T11:00:00',
          },
        ])
        prisonApi.getActivities = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 5,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'ACTIVITY',
            eventDescription: 'Prison Activities',
            eventLocation: 'Somewhere',
            comment: 'A comment.',
            startTime: '2019-12-11T18:00:00',
            endTime: '2019-12-11T19:00:00',
          },
        ])
      })

      it('should return events sorted by start time', async () => {
        const events = await service.getExistingEventsForOffender({}, 'LEI', '11/12/2019', 'ABC123')

        expect(events).toEqual([
          { eventDescription: '**Due for release**' },
          { eventDescription: '**Court visit scheduled**' },
          expect.objectContaining({
            locationId: 2,
            eventDescription: 'Office 1 - An appointment',
            startTime: '12:00',
            endTime: '13:00',
          }),
          expect.objectContaining({
            locationId: 1,
            eventDescription: 'Visiting room - Visit - A comment.',
            startTime: '14:00',
            endTime: '15:00',
          }),
          expect.objectContaining({
            locationId: 3,
            eventDescription: 'Somewhere else - Transfer - A comment.',
            startTime: '16:00',
            endTime: '17:00',
          }),
          expect.objectContaining({
            locationId: 5,
            eventDescription: 'Somewhere - Activity - A comment.',
            startTime: '18:00',
            endTime: '19:00',
          }),
        ])
      })
    })

    describe('when there are errors with prisonApi', () => {
      it('should return the error', async () => {
        const error = new Error('Network error')
        prisonApi.getVisits.mockImplementation(() => Promise.reject(error))

        const events = await service.getExistingEventsForOffender({}, 'LEI', '11/12/2019', 'ABC123')

        expect(events).toEqual(error)
      })
    })
  })

  describe('get events for a location', () => {
    it('should call the correct endpoints with the correct parameters', async () => {
      const expectedParameters = {
        agencyId: 'LEI',
        date: '2019-12-11',
        locationId: 123,
      }

      await service.getExistingEventsForLocation({}, 'LEI', 123, '11/12/2019')

      expect(prisonApi.getActivitiesAtLocation).toHaveBeenCalledWith(systemToken, expectedParameters)
      expect(prisonApi.getActivityList).toHaveBeenCalledWith({}, { ...expectedParameters, usage: 'VISIT' })
      expect(prisonApi.getActivityList).toHaveBeenCalledWith({}, { ...expectedParameters, usage: 'APP' })
    })

    describe('when there are no errors', () => {
      beforeEach(() => {
        prisonApi.getActivitiesAtLocation = jest.fn().mockResolvedValue([
          {
            offenderNo: 'ABC123',
            locationId: 1,
            firstName: 'Test',
            lastName: 'Offender',
            event: 'PRISON_ACT',
            eventDescription: 'Prison activity',
            eventLocation: 'Gym',
            comment: 'A comment.',
            startTime: '2019-12-11T15:00:00',
            endTime: '2019-12-11T16:00:00',
          },
        ])
        prisonApi.getActivityList
          .mockResolvedValueOnce([
            {
              offenderNo: 'ABC123',
              locationId: 2,
              firstName: 'Test',
              lastName: 'Offender',
              event: 'VISIT',
              eventDescription: 'Visit',
              eventLocation: 'Visiting room',
              comment: 'A comment.',
              startTime: '2019-12-11T14:00:00',
              endTime: '2019-12-11T15:00:00',
            },
          ])
          .mockResolvedValueOnce([
            {
              offenderNo: 'ABC123',
              locationId: 3,
              firstName: 'Test',
              lastName: 'Offender',
              event: 'APPT',
              eventDescription: 'An appointment',
              eventLocation: 'Office 1',
              startTime: '2019-12-11T12:00:00',
              endTime: '2019-12-11T13:00:00',
            },
          ])
      })

      it('should return events sorted by start time', async () => {
        const events = await service.getExistingEventsForLocation({}, 'LEI', 123, '11/12/2019')

        expect(events).toEqual([
          expect.objectContaining({
            locationId: 3,
            eventDescription: 'Office 1 - An appointment',
            startTime: '12:00',
            endTime: '13:00',
          }),
          expect.objectContaining({
            locationId: 2,
            eventDescription: 'Visiting room - Visit - A comment.',
            startTime: '14:00',
            endTime: '15:00',
          }),
          expect.objectContaining({
            locationId: 1,
            eventDescription: 'Gym - Prison activity - A comment.',
            startTime: '15:00',
            endTime: '16:00',
          }),
        ])
      })
    })

    describe('when there are errors with prisonApi', () => {
      it('should return the error', async () => {
        const error = new Error('Network error')
        prisonApi.getActivitiesAtLocation.mockImplementation(() => Promise.reject(error))

        const events = await service.getExistingEventsForLocation({}, 'LEI', 123, '11/12/2019')

        expect(events).toEqual(error)
      })
    })
  })
})
