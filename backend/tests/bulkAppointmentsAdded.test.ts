Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'bulkAppoin... Remove this comment to see the full error message
const { bulkAppointmentsAddedFactory } = require('../controllers/appointments/bulkAppointmentsAdded')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
let controller

beforeEach(() => {
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'controller' because it is a cons... Remove this comment to see the full error message
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
        flash: jest.fn().mockReturnValue([
          { lastName: 'Smith', offenderNo: 'ABC123' },
          { lastName: 'Jones', offenderNo: 'ABC345' },
        ]),
      }
      const res = { ...mockRes }

      it('should render the confirm appointments page with prisoners list populated from req.flash', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'index' does not exist on type '({ prison... Remove this comment to see the full error message
        await controller.index(req, res)

        expect(req.session.data).toBe(null)

        expect(req.flash).toBeCalledWith('prisonersRemoved')

        expect(res.render).toBeCalledWith('bulkAppointmentsAdded.njk', {
          prisonersRemoved: appointmentDetails.prisonersRemoved,
        })
      })
    })
  })
})
