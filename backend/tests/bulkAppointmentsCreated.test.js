Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const { index } = require('../controllers/bulkAppointmentsCreated').bulkAppointmentsCreatedFactory()

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
    prisonersNotFound: ['ABC123', 'ABC345', 'ABC678'],
    prisonersListed: [
      {
        bookingId: 'K00278',
        offenderNo: 'G1683VN',
        firstName: 'Elton',
        lastName: 'Abbatiello',
      },
    ],
  }

  const mockRes = { render: jest.fn(), redirect: jest.fn(), locals: {} }

  describe('index', () => {
    describe('when there are no errors', () => {
      const req = { session: { data: { ...appointmentDetails } } }
      const res = { ...mockRes }

      it('should render the confirm appointments confirm page', async () => {
        await index(req, res)

        expect(res.render).toBeCalledWith('appointmentsCreated.njk', {
          prisonersNotFound: appointmentDetails.prisonersNotFound,
        })
      })
    })

    describe('when there is an error', () => {
      const req = { session: {} }
      const res = { ...mockRes }

      it('should render the error page', async () => {
        await index(req, res)

        expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
      })
    })
  })
})
