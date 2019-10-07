Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const { bulkAppointmentsClashesFactory } = require('../controllers/bulkAppointmentsClashes')

let req
let res
let logError
let controller

beforeEach(() => {
  elite2Api.addBulkAppointments = jest.fn([])
  elite2Api.getVisits = jest.fn().mockResolvedValue([
    {
      offenderNo: 'G4803UT',
      locationId: 456,
      firstName: 'Bobby',
      lastName: 'Abdulkadir',
      event: 'VISIT',
      eventDescription: 'Visit',
      eventLocation: 'Visiting room',
      comment: 'A comment.',
      startTime: '2019-09-23T15:00:00',
      endTime: '2019-09-23T16:00:00',
    },
  ])
  elite2Api.getAppointments = jest.fn().mockResolvedValue([
    {
      offenderNo: 'G1683VN',
      locationId: 123,
      firstName: 'Elton',
      lastName: 'Abbatiello',
      event: 'APPT',
      eventDescription: 'An appointment',
      eventLocation: 'Office 1',
      comment: 'A comment.',
      startTime: '2019-09-23T15:00:00',
      endTime: '2019-09-23T16:00:00',
    },
  ])
  elite2Api.getExternalTransfers = jest.fn().mockResolvedValue([
    {
      offenderNo: 'G5402VR',
      locationId: 101,
      firstName: 'Gabriel',
      lastName: 'Agugliaro',
      event: 'TRANS',
      eventDescription: 'Transfer',
      eventLocation: 'Somewhere else',
      comment: 'A comment.',
      startTime: '2019-09-23T15:00:00',
      endTime: '2019-09-23T16:00:00',
    },
  ])
  elite2Api.getCourtEvents = jest.fn().mockResolvedValue([
    {
      offenderNo: 'G1683VN',
      locationId: 789,
      firstName: 'Elton',
      lastName: 'Abbatiello',
      event: 'COURT',
      eventDescription: 'Court event',
      eventLocation: 'Court',
      comment: 'A comment.',
      startTime: '2019-09-23T15:00:00',
      endTime: '2019-09-23T16:00:00',
    },
  ])

  req = {
    originalUrl: '/bulk-appointments/confirm-appointment/',
    session: {
      userDetails: {
        activeCaseLoadId: 'LEI',
      },
    },
    body: {},
  }
  res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
  logError = jest.fn()
  controller = bulkAppointmentsClashesFactory(elite2Api, logError)
})

const appointmentDetails = {
  appointmentType: 'TEST',
  appointmentTypeDescription: 'Test Type',
  location: 1,
  locationDescription: 'Chapel',
  date: '23/09/2019',
  startTime: '2019-09-23T15:30:00',
  endTime: '2019-09-30T16:30:00',
  comments: 'Activity comment',
  prisonersNotFound: [],
  prisonersListed: [
    {
      bookingId: '111',
      offenderNo: 'G1683VN',
      firstName: 'Elton',
      lastName: 'Abbatiello',
    },
    {
      bookingId: '222',
      offenderNo: 'G4803UT',
      firstName: 'Bobby',
      lastName: 'Abdulkadir',
    },
    {
      bookingId: '333',
      offenderNo: 'G4346UT',
      firstName: 'Dewey',
      lastName: 'Affolter',
    },
    {
      bookingId: '444',
      offenderNo: 'G5402VR',
      firstName: 'Gabriel',
      lastName: 'Agugliaro',
    },
  ],
}

describe('appointment clashes', () => {
  describe('and viewing page', () => {
    describe('and there is data', () => {
      beforeEach(() => {
        req.session.data = { ...appointmentDetails }
      })

      it('should call the appropiate endpoints with the correct search criteria', async () => {
        const searchCriteria = {
          agencyId: 'LEI',
          date: '2019-09-23',
          offenderNumbers: ['G1683VN', 'G4803UT', 'G4346UT', 'G5402VR'],
        }

        await controller.index(req, res)

        expect(elite2Api.getVisits).toHaveBeenCalledWith({}, searchCriteria)
        expect(elite2Api.getAppointments).toHaveBeenCalledWith({}, searchCriteria)
        expect(elite2Api.getExternalTransfers).toHaveBeenCalledWith({}, searchCriteria)
        expect(elite2Api.getCourtEvents).toHaveBeenCalledWith({}, searchCriteria)
      })

      it('should render the appointments clashes page with the correct data', async () => {
        await controller.index(req, res)

        const expectedTemplateObject = {
          appointmentDetails,
          prisonersWithClashes: [
            {
              bookingId: '111',
              clashes: [
                {
                  comment: 'A comment.',
                  endTime: '2019-09-23T16:00:00',
                  event: 'APPT',
                  eventDescription: 'An appointment',
                  eventLocation: 'Office 1',
                  firstName: 'Elton',
                  lastName: 'Abbatiello',
                  locationId: 123,
                  offenderNo: 'G1683VN',
                  startTime: '2019-09-23T15:00:00',
                },
                {
                  comment: 'A comment.',
                  endTime: '2019-09-23T16:00:00',
                  event: 'COURT',
                  eventDescription: 'Court event',
                  eventLocation: 'Court',
                  firstName: 'Elton',
                  lastName: 'Abbatiello',
                  locationId: 789,
                  offenderNo: 'G1683VN',
                  startTime: '2019-09-23T15:00:00',
                },
              ],
              firstName: 'Elton',
              lastName: 'Abbatiello',
              offenderNo: 'G1683VN',
            },
            {
              bookingId: '222',
              clashes: [
                {
                  comment: 'A comment.',
                  endTime: '2019-09-23T16:00:00',
                  event: 'VISIT',
                  eventDescription: 'Visit',
                  eventLocation: 'Visiting room',
                  firstName: 'Bobby',
                  lastName: 'Abdulkadir',
                  locationId: 456,
                  offenderNo: 'G4803UT',
                  startTime: '2019-09-23T15:00:00',
                },
              ],
              firstName: 'Bobby',
              lastName: 'Abdulkadir',
              offenderNo: 'G4803UT',
            },
            {
              bookingId: '444',
              clashes: [
                {
                  comment: 'A comment.',
                  endTime: '2019-09-23T16:00:00',
                  event: 'TRANS',
                  eventDescription: 'Transfer',
                  eventLocation: 'Somewhere else',
                  firstName: 'Gabriel',
                  lastName: 'Agugliaro',
                  locationId: 101,
                  offenderNo: 'G5402VR',
                  startTime: '2019-09-23T15:00:00',
                },
              ],
              firstName: 'Gabriel',
              lastName: 'Agugliaro',
              offenderNo: 'G5402VR',
            },
          ],
        }
        expect(res.render).toBeCalledWith('appointmentsClashes.njk', expectedTemplateObject)
      })
    })

    describe('and there is no data', () => {
      it('should render the error page', async () => {
        await controller.index(req, res)

        expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
      })
    })

    describe('and there is an issue with getting other events', () => {
      beforeEach(() => {
        elite2Api.getVisits = jest.fn().mockRejectedValue(new Error('There has been an error'))
      })

      it('should log an error and render the error page', async () => {
        req.session.data = { ...appointmentDetails }

        await controller.index(req, res)

        expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
      })
    })
  })

  describe('and submitting the data', () => {
    describe('and the start times are the same', () => {
      describe('and some prisoners have been selected for removal', () => {
        beforeEach(() => {
          elite2Api.addBulkAppointments = jest.fn().mockReturnValue('All good')
          req.session.data = { ...appointmentDetails }
        })

        it('should submit the correct data and redirect to the appointments added page', async () => {
          req.body = { G1683VN: 'remove', G4803UT: 'remove' }

          await controller.post(req, res)

          expect(elite2Api.addBulkAppointments).toBeCalledWith(res.locals, {
            appointmentDefaults: {
              appointmentType: 'TEST',
              locationId: 1,
              comment: 'Activity comment',
              endTime: '2019-09-30T16:30:00',
              startTime: '2019-09-23T15:30:00',
            },
            appointments: [{ bookingId: '333' }, { bookingId: '444' }],
          })

          expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')
        })
      })

      describe('and there are recurring appointments', () => {
        beforeEach(() => {
          elite2Api.addBulkAppointments = jest.fn().mockReturnValue('All good')
          req.session.data = {
            ...appointmentDetails,
            recurring: 'yes',
            times: '5',
            repeats: 'WEEKLY',
          }
        })

        it('should submit the correct data and redirect to the appointments added page', async () => {
          await controller.post(req, res)

          expect(elite2Api.addBulkAppointments).toBeCalledWith(res.locals, {
            appointmentDefaults: {
              appointmentType: 'TEST',
              comment: 'Activity comment',
              locationId: 1,
              startTime: '2019-09-23T15:30:00',
              endTime: '2019-09-30T16:30:00',
            },
            appointments: [{ bookingId: '111' }, { bookingId: '222' }, { bookingId: '333' }, { bookingId: '444' }],
            repeat: {
              count: 5,
              repeatPeriod: 'WEEKLY',
            },
          })

          expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')
        })
      })
    })
  })
})
