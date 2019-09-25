Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const { view, submit } = require('../controllers/bulkAppointmentsConfirm').bulkAppointmentsConfirmFactory(elite2Api)
const { logError } = require('../logError')

jest.mock('../logError', () => ({
  logError: jest.fn(),
}))

describe('bulk appointments confirm', () => {
  const appointmentDetails = {
    appointmentType: 'Test type',
    location: 'Chapel',
    startTime: '2019-09-23T15:30:00',
    endTime: '2019-09-30T16:30:00',
    comment: 'Activity comment',
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

  const mockReq = {
    originalUrl: '/bulk-appointments/confirm-appointment/',
  }

  const mockRes = { render: jest.fn(), redirect: jest.fn(), locals: {} }

  describe('view', () => {
    describe('when there are no errors', () => {
      const req = { ...mockReq, session: { data: { ...appointmentDetails } } }
      const res = { ...mockRes }

      it('should render the confirm appointments confirm page', async () => {
        await view(req, res)

        expect(res.render).toBeCalledWith('confirmAppointments.njk', { appointmentDetails })
      })
    })

    describe('when there is an error', () => {
      const req = { ...mockReq, session: {} }
      const res = { ...mockRes }

      it('should render the error page', async () => {
        await view(req, res)

        expect(res.render).toBeCalledWith('error.njk', { url: '/need-to-upload-file' })
      })
    })
  })

  describe('submit', () => {
    const req = { ...mockReq, session: { data: { ...appointmentDetails } } }
    const res = { ...mockRes }

    describe('when there are no errors', () => {
      beforeEach(() => {
        elite2Api.addBulkAppointments = jest.fn().mockReturnValue('All good')
      })

      it('should submit the data and redirect to success page', async () => {
        await submit(req, res)

        expect(elite2Api.addBulkAppointments).toBeCalledWith(
          {},
          {
            appointmentDefaults: {
              appointmentType: 'Test type',
              comment: 'Activity comment',
              endTime: '2019-09-30T16:30:00',
              locationId: NaN,
              startTime: '2019-09-23T15:30:00',
            },
            appointments: [
              { bookingId: 'K00278' },
              { bookingId: 'V37486' },
              { bookingId: 'V38608' },
              { bookingId: 'V31474' },
            ],
          }
        )

        expect(res.redirect).toBeCalledWith('/bulk-appointments/success')
      })
    })

    describe('when there is an error', () => {
      beforeEach(() => {
        elite2Api.addBulkAppointments = jest.fn().mockImplementation(() => {
          throw new Error('There has been an error')
        })
      })

      it('should log an error and render the error page', async () => {
        await submit(req, res)

        expect(logError).toBeCalledWith(
          '/bulk-appointments/confirm-appointment/',
          new Error('There has been an error'),
          'Sorry, the service is unavailable'
        )
        expect(res.render).toBeCalledWith('error.njk', { url: '/need-to-upload-file' })
      })
    })
  })
})
