Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const { bulkAppointmentsAddedFactory } = require('../controllers/appointments/bulkAppointmentsAdded')
const config = require('../config')

config.app.notmEndpointUrl = '//newNomisEndPointUrl/'
let controller

beforeEach(() => {
  controller = bulkAppointmentsAddedFactory()
})

describe('bulk appointments confirm', () => {
  const appointmentDetails = {
    appointmentType: 'Test type',
    location: 'Chapel',
    startTime: '2019-09-23T15:30:00',
    endTime: '2019-09-30T16:30:00',
    comment: 'Activity comment',
    prisonersNotFound: [],
    prisonersRemoved: [
      {
        offenderNo: 'ABC123',
        lastName: 'Smith',
      },
      {
        offenderNo: 'ABC345',
        lastName: 'Jones',
      },
    ],
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
      const req = {
        session: { data: null },
        flash: jest
          .fn()
          .mockReturnValue([{ lastName: 'Smith', offenderNo: 'ABC123' }, { lastName: 'Jones', offenderNo: 'ABC345' }]),
      }
      const res = { ...mockRes }

      it('should render the confirm appointments page with prisoners list populated from req.flash', async () => {
        await controller.index(req, res)

        expect(req.session.data).toBe(null)

        expect(req.flash).toBeCalledWith('prisonersRemoved')

        expect(res.render).toBeCalledWith('bulkAppointmentsAdded.njk', {
          prisonersRemoved: appointmentDetails.prisonersRemoved,
          dpsUrl: '//newNomisEndPointUrl/',
        })
      })
    })
  })
})
