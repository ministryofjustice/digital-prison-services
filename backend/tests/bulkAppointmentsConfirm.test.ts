Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisonApi'... Remove this comment to see the full error message
const prisonApi = {}
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'raiseAnaly... Remove this comment to see the full error message
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'bulkAppoin... Remove this comment to see the full error message
const { bulkAppointmentsConfirmFactory } = require('../controllers/appointments/bulkAppointmentsConfirm')

jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'req'.
let req
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'res'.
let res
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logError'.
let logError
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
let controller

beforeEach(() => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
  prisonApi.addAppointments = jest.fn()
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisits' does not exist on type '{}'.
  prisonApi.getVisits = jest.fn().mockResolvedValue([])
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointments' does not exist on type ... Remove this comment to see the full error message
  prisonApi.getAppointments = jest.fn().mockResolvedValue([])
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
  prisonApi.getExternalTransfers = jest.fn().mockResolvedValue([])
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
  prisonApi.getCourtEvents = jest.fn().mockResolvedValue([])

  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'req' because it is a constant.
  req = {
    originalUrl: '/bulk-appointments/confirm-appointment/',
    session: {
      userDetails: {
        activeCaseLoadId: 'LEI',
      },
    },
    flash: jest.fn(),
  }
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'res' because it is a constant.
  res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'logError' because it is a consta... Remove this comment to see the full error message
  logError = jest.fn()
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'controller' because it is a cons... Remove this comment to see the full error message
  controller = bulkAppointmentsConfirmFactory(prisonApi, logError)
})

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appointmen... Remove this comment to see the full error message
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
  prisonersDuplicated: [],
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

describe('when confirming bulk appointment details', () => {
  describe('and viewing the page', () => {
    describe('and there is data', () => {
      it('should not send recurring information when recurring  is not set', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
        req.session.data = {
          ...appointmentDetails,
        }
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'post' does not exist on type '({ prisonA... Remove this comment to see the full error message
        await controller.post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'appointmentSlipsData' does not exist on ... Remove this comment to see the full error message
        expect(req.session.appointmentSlipsData).toEqual({
          appointmentDetails: {
            appointmentTypeDescription: appointmentDetails.appointmentTypeDescription,
            comments: appointmentDetails.comments,
            endTime: appointmentDetails.endTime,
            locationDescription: appointmentDetails.locationDescription,
            startTime: appointmentDetails.startTime,
          },
          prisonersListed: appointmentDetails.prisonersListed,
        })

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
        expect(prisonApi.addAppointments).toBeCalledWith(res.locals, {
          appointmentDefaults: {
            appointmentType: 'TEST',
            comment: 'Activity comment',
            locationId: 1,
            startTime: '2019-09-23T15:30:00',
            endTime: '2019-09-30T16:30:00',
          },
          appointments: [{ bookingId: '111' }, { bookingId: '222' }, { bookingId: '333' }, { bookingId: '444' }],
        })
      })

      it('should render the confirm appointments page with the correct values', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
        req.session.data = { ...appointmentDetails }

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'index' does not exist on type '({ prison... Remove this comment to see the full error message
        await controller.index(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toBeCalledWith('bulkAppointmentsConfirm.njk', {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
          appointmentDetails: { ...req.session.data, date: '2019-09-23T00:00:00' },
          previousPage: 'upload-file',
        })
      })

      describe('and there are duplicate offender numbers', () => {
        it('should allow the user to navigate back to the invalid numbers page', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
          req.session.data = { ...appointmentDetails, prisonersDuplicated: ['DUPLICATE'] }

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'index' does not exist on type '({ prison... Remove this comment to see the full error message
          await controller.index(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
          expect(res.render).toBeCalledWith('bulkAppointmentsConfirm.njk', {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
            appointmentDetails: { ...req.session.data, date: '2019-09-23T00:00:00' },
            previousPage: 'invalid-numbers',
          })
        })
      })

      describe('and there are invalid/not found offender numbers', () => {
        it('should allow the user to navigate back to the invalid numbers page', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
          req.session.data = { ...appointmentDetails, prisonersNotFound: ['NOTFOUND'] }

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'index' does not exist on type '({ prison... Remove this comment to see the full error message
          await controller.index(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
          expect(res.render).toBeCalledWith('bulkAppointmentsConfirm.njk', {
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
            appointmentDetails: { ...req.session.data, date: '2019-09-23T00:00:00' },
            previousPage: 'invalid-numbers',
          })
        })
      })
    })

    describe('and there is no data', () => {
      it('should redirect to start when session is invalid', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'index' does not exist on type '({ prison... Remove this comment to see the full error message
        await controller.index(req, res)

        expect(res.redirect).toBeCalledWith('/bulk-appointments/add-appointment-details')
      })
    })
  })

  describe('and submitting the data', () => {
    describe('and the start times are the same', () => {
      describe('and there are no errors', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
          req.session.data = { ...appointmentDetails }
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          prisonApi.addAppointments = jest.fn().mockReturnValue('All good')
        })

        it('should submit the data and redirect to the appointments added page', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'post' does not exist on type '({ prisonA... Remove this comment to see the full error message
          await controller.post(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          expect(prisonApi.addAppointments).toBeCalledWith(res.locals, {
            appointmentDefaults: {
              appointmentType: 'TEST',
              locationId: 1,
              comment: 'Activity comment',
              endTime: '2019-09-30T16:30:00',
              startTime: '2019-09-23T15:30:00',
            },
            appointments: [{ bookingId: '111' }, { bookingId: '222' }, { bookingId: '333' }, { bookingId: '444' }],
          })

          expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')
          expect(raiseAnalyticsEvent).toBeCalledWith(
            'Bulk Appointments',
            `Appointments created at ${
              // @ts-expect-error ts-migrate(2339) FIXME: Property 'activeCaseLoadId' does not exist on type... Remove this comment to see the full error message
              req.session.userDetails.activeCaseLoadId
            }`,
            `Appointment type - ${appointmentDetails.appointmentTypeDescription}`,
            4
          )
        })
      })
    })

    describe('and there are individual start and end times', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
        prisonApi.addAppointments = jest.fn().mockReturnValue('All good')
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
        req.session.data = {
          appointmentType: 'TEST',
          location: 1,
          date: '27/09/2019',
          sameTimeAppointments: 'no',
          comments: 'Activity comment',
          prisonersNotFound: [],
          prisonersDuplicated: [],
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
          ],
        }
      })

      describe('and there are no form errors', () => {
        it('should submit the data and redirect to the appointments added page', async () => {
          jest.spyOn(Date, 'now').mockImplementation(() => 1569481200000) // Thursday 2019-09-26T07:00:00.000Z
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
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

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'post' does not exist on type '({ prisonA... Remove this comment to see the full error message
          await controller.post(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          expect(prisonApi.addAppointments).toBeCalledWith(res.locals, {
            appointmentDefaults: {
              appointmentType: 'TEST',
              comment: 'Activity comment',
              locationId: 1,
              startTime: '2019-09-27T23:59:00',
              endTime: undefined,
            },
            appointments: [
              { bookingId: '111', startTime: '2019-09-27T08:30:00', endTime: '' },
              { bookingId: '222', startTime: '2019-09-27T10:00:00', endTime: '' },
            ],
          })

          expect(res.redirect).toBeCalledWith('/bulk-appointments/appointments-added')

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockRestore' does not exist on type '() ... Remove this comment to see the full error message
          Date.now.mockRestore()
        })
      })

      describe('and there are form errors ', () => {
        it('should not submit the data and return with correct error messages', async () => {
          jest.spyOn(Date, 'now').mockImplementation(() => 1569573900000) // Friday 2019-09-27T08:45:00.000Z

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
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

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'post' does not exist on type '({ prisonA... Remove this comment to see the full error message
          await controller.post(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
          expect(prisonApi.addAppointments).not.toBeCalled()
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
          expect(res.render).toBeCalledWith('bulkAppointmentsConfirm.njk', {
            appointmentDetails: {
              appointmentType: 'TEST',
              location: 1,
              sameTimeAppointments: 'no',
              comments: 'Activity comment',
              prisonersNotFound: [],
              prisonersDuplicated: [],
              prisonersListed: [
                {
                  bookingId: '111',
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
                  bookingId: '222',
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
            previousPage: 'upload-file',
          })

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockRestore' does not exist on type '() ... Remove this comment to see the full error message
          Date.now.mockRestore()
        })
      })
    })

    describe('and there are recurring appointments', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
        prisonApi.addAppointments = jest.fn().mockReturnValue('All good')
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
        req.session.data = {
          ...appointmentDetails,
          recurring: 'yes',
          times: '5',
          repeats: 'WEEKLY',
        }
      })

      it('should submit the correct data and redirect to the appointments added page', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'post' does not exist on type '({ prisonA... Remove this comment to see the full error message
        await controller.post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'appointmentSlipsData' does not exist on ... Remove this comment to see the full error message
        expect(req.session.appointmentSlipsData).toEqual({
          appointmentDetails: {
            appointmentTypeDescription: appointmentDetails.appointmentTypeDescription,
            comments: appointmentDetails.comments,
            endTime: appointmentDetails.endTime,
            locationDescription: appointmentDetails.locationDescription,
            startTime: appointmentDetails.startTime,
          },
          prisonersListed: appointmentDetails.prisonersListed,
        })

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
        expect(prisonApi.addAppointments).toBeCalledWith(res.locals, {
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

        expect(raiseAnalyticsEvent).toBeCalledWith(
          'Bulk Appointments',
          `Appointments created at ${
            // @ts-expect-error ts-migrate(2339) FIXME: Property 'activeCaseLoadId' does not exist on type... Remove this comment to see the full error message
            req.session.userDetails.activeCaseLoadId
          }`,
          `Appointment type - ${appointmentDetails.appointmentTypeDescription}`,
          20
        )
      })
    })

    describe('and there are appointment clashes', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
        prisonApi.addAppointments = jest.fn().mockReturnValue('All good')
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointments' does not exist on type ... Remove this comment to see the full error message
        prisonApi.getAppointments = jest.fn().mockResolvedValue([
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
        req.session.data = { ...appointmentDetails }
      })

      it('should redirect to the appointment clashes page', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'post' does not exist on type '({ prisonA... Remove this comment to see the full error message
        await controller.post(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/bulk-appointments/appointment-clashes')
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ session... Remove this comment to see the full error message
        expect(req.flash).not.toHaveBeenCalled()
      })
    })

    describe('and there is an issue with the api', () => {
      const error = new Error('There has been an error')
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addAppointments' does not exist on type ... Remove this comment to see the full error message
        prisonApi.addAppointments.mockRejectedValue(error)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
        req.session.data = { ...appointmentDetails }
      })

      it('should log an error and render the error page', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
        res.status = jest.fn()

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'post' does not exist on type '({ prisonA... Remove this comment to see the full error message
        await expect(controller.post(req, res)).rejects.toThrowError(error)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirectUrl' does not exist on type '{}'... Remove this comment to see the full error message
        expect(res.locals.redirectUrl).toBe('/bulk-appointments/need-to-upload-file')
      })
    })

    it('should check for appointment clashes', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'data' does not exist on type '{ userDeta... Remove this comment to see the full error message
      req.session.data = { ...appointmentDetails }
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'post' does not exist on type '({ prisonA... Remove this comment to see the full error message
      await controller.post(req, res)

      const searchCriteria = {
        agencyId: 'LEI',
        date: '2019-09-23',
        offenderNumbers: ['G1683VN', 'G4803UT', 'G4346UT', 'G5402VR'],
      }

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisits' does not exist on type '{}'.
      expect(prisonApi.getVisits).toHaveBeenCalledWith({}, searchCriteria)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointments' does not exist on type ... Remove this comment to see the full error message
      expect(prisonApi.getAppointments).toHaveBeenCalledWith({}, searchCriteria)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getExternalTransfers' does not exist on ... Remove this comment to see the full error message
      expect(prisonApi.getExternalTransfers).toHaveBeenCalledWith({}, searchCriteria)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCourtEvents' does not exist on type '... Remove this comment to see the full error message
      expect(prisonApi.getCourtEvents).toHaveBeenCalledWith({}, searchCriteria)
    })
  })
})
