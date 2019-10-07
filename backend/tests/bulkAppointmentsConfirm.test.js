Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const { bulkAppointmentsConfirmFactory } = require('../controllers/bulkAppointmentsConfirm')

let req
let res
let logError
let controller

beforeEach(() => {
  elite2Api.addBulkAppointments = jest.fn()
  elite2Api.getVisits = jest.fn().mockResolvedValue([])
  elite2Api.getAppointments = jest.fn().mockResolvedValue([])
  elite2Api.getExternalTransfers = jest.fn().mockResolvedValue([])
  elite2Api.getCourtEvents = jest.fn().mockResolvedValue([])

  req = {
    originalUrl: '/bulk-appointments/confirm-appointment/',
    session: {
      userDetails: {
        activeCaseLoadId: 'LEI',
      },
    },
  }
  res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
  logError = jest.fn()
  controller = bulkAppointmentsConfirmFactory(elite2Api, logError)
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
      bookingId: 'K00278',
      offenderNo: 'G1683VN',
      firstName: 'Elton',
      lastName: 'Abbatiello',
    },
    {
      bookingId: 'V37486',
      offenderNo: 'G4803UT',
      firstName: 'Bobby',
      lastName: 'Abdulkadir',
    },
    {
      bookingId: 'V38608',
      offenderNo: 'G4346UT',
      firstName: 'Dewey',
      lastName: 'Affolter',
    },
    {
      bookingId: 'V31474',
      offenderNo: 'G5402VR',
      firstName: 'Gabriel',
      lastName: 'Agugliaro',
    },
  ],
}

describe('when confirming bulk appointment details', () => {
  describe('and viewing the page', () => {
    describe('and there is data', () => {
      it('should render the confirm appointments page', async () => {
        req.session.data = { ...appointmentDetails }

        await controller.index(req, res)

        expect(res.render).toBeCalledWith('confirmAppointments.njk', {
          appointmentDetails: { ...req.session.data, date: '2019-09-23T00:00:00' },
        })
      })
    })

    describe('and there is no data', () => {
      it('should render the error page', async () => {
        await controller.index(req, res)

        expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
      })
    })
  })

  describe('and submitting the data', () => {
    describe('and the start times are the same', () => {
      describe('and there are no errors', () => {
        beforeEach(() => {
          req.session.data = { ...appointmentDetails }
          elite2Api.addBulkAppointments = jest.fn().mockReturnValue('All good')
        })

        it('should submit the data and redirect to the appointments added page', async () => {
          await controller.post(req, res)

          expect(elite2Api.addBulkAppointments).toBeCalledWith(res.locals, {
            appointmentDefaults: {
              appointmentType: 'TEST',
              locationId: 1,
              comment: 'Activity comment',
              endTime: '2019-09-30T16:30:00',
              startTime: '2019-09-23T15:30:00',
            },
            appointments: [
              { bookingId: 'K00278' },
              { bookingId: 'V37486' },
              { bookingId: 'V38608' },
              { bookingId: 'V31474' },
            ],
          })

          expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')
        })
      })
    })

    describe('and there are individual start and end times', () => {
      beforeEach(() => {
        elite2Api.addBulkAppointments = jest.fn().mockReturnValue('All good')
        req.session.data = {
          appointmentType: 'TEST',
          location: 1,
          date: '27/09/2019',
          sameTimeAppointments: 'no',
          comments: 'Activity comment',
          prisonersNotFound: [],
          prisonersListed: [
            {
              bookingId: 'K00278',
              offenderNo: 'G1683VN',
              firstName: 'Elton',
              lastName: 'Abbatiello',
            },
            {
              bookingId: 'V37486',
              offenderNo: 'G4803UT',
              firstName: 'Bobby',
              lastName: 'Abdulkadir',
            },
          ],
        }
      })

      describe('and there are no form errors', () => {
        it('should submit the data and redirect to the appointments added page', async () => {
          jest.spyOn(Date, 'now').mockImplementation(() => 1569481200000) // Thursday 2019-09-26T07:00:00.000Z
          req.body = {
            G1683VNstartTimeHours: '08',
            G1683VNstartTimeMinutes: '30',
            G1683VNendTimeHours: '',
            G1683VNendTimeMinutes: '',
            G4803UTstartTimeHours: '10',
            G4803UTstartTimeMinutes: '00',
            G4803UTendTimeHours: '',
            G4803UTendTimeMinutes: '',
          }

          await controller.post(req, res)

          expect(elite2Api.addBulkAppointments).toBeCalledWith(res.locals, {
            appointmentDefaults: {
              appointmentType: 'TEST',
              comment: 'Activity comment',
              locationId: 1,
              startTime: '2019-09-27T23:59:00',
              endTime: undefined,
            },
            appointments: [
              { bookingId: 'K00278', startTime: '2019-09-27T08:30:00', endTime: '' },
              { bookingId: 'V37486', startTime: '2019-09-27T10:00:00', endTime: '' },
            ],
          })

          expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')

          Date.now.mockRestore()
        })
      })

      describe('and there are form errors ', () => {
        it('should not submit the data and return with correct error messages', async () => {
          jest.spyOn(Date, 'now').mockImplementation(() => 1569573900000) // Friday 2019-09-27T08:45:00.000Z

          req.body = {
            G1683VNstartTimeHours: '08',
            G1683VNstartTimeMinutes: '30',
            G1683VNendTimeHours: '08',
            G1683VNendTimeMinutes: '00',
            G4803UTstartTimeHours: '',
            G4803UTstartTimeMinutes: '',
            G4803UTendTimeHours: '',
            G4803UTendTimeMinutes: '',
          }

          await controller.post(req, res)

          expect(elite2Api.addBulkAppointments).not.toBeCalled()
          expect(res.render).toBeCalledWith('confirmAppointments.njk', {
            appointmentDetails: {
              appointmentType: 'TEST',
              location: 1,
              sameTimeAppointments: 'no',
              comments: 'Activity comment',
              prisonersNotFound: [],
              prisonersListed: [
                {
                  bookingId: 'K00278',
                  startTime: '2019-09-27T08:30:00',
                  startTimeHours: '08',
                  startTimeMinutes: '30',
                  endTime: '2019-09-27T08:00:00',
                  endTimeHours: '08',
                  endTimeMinutes: '00',
                  firstName: 'Elton',
                  lastName: 'Abbatiello',
                  offenderNo: 'G1683VN',
                },
                {
                  bookingId: 'V37486',
                  startTime: '',
                  startTimeHours: '',
                  startTimeMinutes: '',
                  endTime: '',
                  endTimeHours: '',
                  endTimeMinutes: '',
                  firstName: 'Bobby',
                  lastName: 'Abdulkadir',
                  offenderNo: 'G4803UT',
                },
              ],
              date: '2019-09-27T00:00:00',
            },
            errors: [
              {
                href: '#G1683VN-start-time-hours',
                text: 'Select a start time for Abbatiello, Elton that is not in the past',
              },
              {
                href: '#G1683VN-end-time-hours',
                text: 'Select an end time for Abbatiello, Elton which is after the start time',
              },
              { href: '#G4803UT-start-time-hours', text: 'Select a start time for Abdulkadir, Bobby' },
            ],
          })

          Date.now.mockRestore()
        })
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
          appointments: [
            { bookingId: 'K00278' },
            { bookingId: 'V37486' },
            { bookingId: 'V38608' },
            { bookingId: 'V31474' },
          ],
          repeat: {
            count: 5,
            repeatPeriod: 'WEEKLY',
          },
        })

        expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')
      })
    })

    describe('and there are appointment clashes', () => {
      beforeEach(() => {
        elite2Api.addBulkAppointments = jest.fn().mockReturnValue('All good')
        elite2Api.getAppointments = jest.fn().mockResolvedValue([
          {
            offenderNo: 'G1683VN',
            locationId: 123,
            firstName: 'Elton',
            lastName: 'Abbatiello',
            event: 'CABA',
            eventDescription: 'Case - Bail Apps',
            eventLocation: 'OFFICE 1',
            comment: 'A comment.',
            startTime: '2019-09-23T15:00:00',
            endTime: '2019-09-23T16:00:00',
          },
        ])
        req.session.data = { ...appointmentDetails }
      })

      it('should redirect to the appointment clashes page', async () => {
        await controller.post(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/bulk-appointments/appointment-clashes')
      })
    })

    describe('and there is an issue with the api', () => {
      beforeEach(() => {
        elite2Api.addBulkAppointments = jest.fn().mockImplementation(() => {
          throw new Error('There has been an error')
        })
        req.session.data = { ...appointmentDetails }
      })

      it('should log an error and render the error page', async () => {
        await controller.post(req, res)

        expect(logError).toBeCalledWith(
          '/bulk-appointments/confirm-appointment/',
          new Error('There has been an error'),
          'Sorry, the service is unavailable'
        )
        expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
      })
    })

    it('should check for appointment clashes', async () => {
      req.session.data = { ...appointmentDetails }
      await controller.post(req, res)

      const searchCriteria = {
        agencyId: 'LEI',
        date: '2019-09-23',
        offenderNumbers: ['G1683VN', 'G4803UT', 'G4346UT', 'G5402VR'],
      }

      expect(elite2Api.getVisits).toHaveBeenCalledWith({}, searchCriteria)
      expect(elite2Api.getAppointments).toHaveBeenCalledWith({}, searchCriteria)
      expect(elite2Api.getExternalTransfers).toHaveBeenCalledWith({}, searchCriteria)
      expect(elite2Api.getCourtEvents).toHaveBeenCalledWith({}, searchCriteria)
    })
  })
})
