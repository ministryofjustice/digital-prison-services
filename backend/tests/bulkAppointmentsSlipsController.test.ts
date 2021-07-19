Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'prisonApi'... Remove this comment to see the full error message
const prisonApi = {}
const { largePrisonersListed, largePrisonersListedWithCell } = require('./bulkAppointmentsTestData')
const bulkAppointmentsSlipsRouter = require('../routes/appointments/bulkAppointmentsSlipsRouter')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'req'.
let req
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'res'.
let res
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'logError'.
let logError
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'controller... Remove this comment to see the full error message
let controller

beforeEach(() => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderSummaries' does not exist on ... Remove this comment to see the full error message
  prisonApi.getOffenderSummaries = jest.fn()
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'req' because it is a constant.
  req = {
    originalUrl: '/bulk-appointments/confirm-appointment/',
    session: {
      appointmentSlipsData: {},
      userDetails: {
        activeCaseLoadId: 'LEI',
        name: 'Test User',
      },
    },
    body: {},
  }
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'res' because it is a constant.
  res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'logError' because it is a consta... Remove this comment to see the full error message
  logError = jest.fn()
  // @ts-expect-error ts-migrate(2588) FIXME: Cannot assign to 'controller' because it is a cons... Remove this comment to see the full error message
  controller = bulkAppointmentsSlipsRouter({ prisonApi, logError })
})

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'appointmen... Remove this comment to see the full error message
const appointmentDetails = {
  startTime: '2019-09-23T15:30:00',
  endTime: '2019-09-30T16:30:00',
  comments: 'Activity comment',
  appointmentTypeDescription: 'Test Type',
  locationDescription: 'Chapel',
}

const prisonersListed = [
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
]

describe('appointment movement slips', () => {
  describe('and viewing page', () => {
    describe('and there is no data', () => {
      it('should render the error page', async () => {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        await controller(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
      })
    })

    describe('and there is a small amount of data', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'appointmentSlipsData' does not exist on ... Remove this comment to see the full error message
        req.session.appointmentSlipsData = { appointmentDetails, prisonersListed }
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
        res.status = jest.fn()
      })

      it('should call the correct endpoint for the extra required offender information', async () => {
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        await controller(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderSummaries' does not exist on ... Remove this comment to see the full error message
        expect(prisonApi.getOffenderSummaries).toHaveBeenCalledWith(res.locals, [
          'G1683VN',
          'G4803UT',
          'G4346UT',
          'G5402VR',
        ])
      })

      it('should render the movement slips page with the correct details', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderSummaries' does not exist on ... Remove this comment to see the full error message
        prisonApi.getOffenderSummaries = jest.fn().mockReturnValue([
          { offenderNo: 'G1683VN', assignedLivingUnitDesc: 'CELL 1' },
          { offenderNo: 'G4803UT', assignedLivingUnitDesc: 'CELL 2' },
          { offenderNo: 'G4346UT', assignedLivingUnitDesc: 'CELL 3' },
          { offenderNo: 'G5402VR', assignedLivingUnitDesc: 'CELL 4' },
        ])

        // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
        await controller(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toHaveBeenCalledWith('movementSlipsPage.njk', {
          appointmentDetails: {
            ...appointmentDetails,
            createdBy: 'T. User',
            prisonersListed: [
              {
                assignedLivingUnitDesc: 'CELL 1',
                bookingId: '111',
                firstName: 'Elton',
                lastName: 'Abbatiello',
                offenderNo: 'G1683VN',
              },
              {
                assignedLivingUnitDesc: 'CELL 2',
                bookingId: '222',
                firstName: 'Bobby',
                lastName: 'Abdulkadir',
                offenderNo: 'G4803UT',
              },
              {
                assignedLivingUnitDesc: 'CELL 3',
                bookingId: '333',
                firstName: 'Dewey',
                lastName: 'Affolter',
                offenderNo: 'G4346UT',
              },
              {
                assignedLivingUnitDesc: 'CELL 4',
                bookingId: '444',
                firstName: 'Gabriel',
                lastName: 'Agugliaro',
                offenderNo: 'G5402VR',
              },
            ],
          },
        })
      })

      describe('and there is a large amount of data', () => {
        beforeEach(() => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'appointmentSlipsData' does not exist on ... Remove this comment to see the full error message
          req.session.appointmentSlipsData = { appointmentDetails, prisonersListed: largePrisonersListed }
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
          res.status = jest.fn()
        })

        it('should call the correct endpoint the correct amount of times for the extra required offender information', async () => {
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
          await controller(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderSummaries' does not exist on ... Remove this comment to see the full error message
          expect(prisonApi.getOffenderSummaries).toHaveBeenCalledWith(
            res.locals,
            largePrisonersListed.slice(0, 100).map((prisoner) => prisoner.offenderNo)
          )
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderSummaries' does not exist on ... Remove this comment to see the full error message
          expect(prisonApi.getOffenderSummaries).toHaveBeenCalledWith(
            res.locals,
            largePrisonersListed.slice(100, 200).map((prisoner) => prisoner.offenderNo)
          )
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderSummaries' does not exist on ... Remove this comment to see the full error message
          expect(prisonApi.getOffenderSummaries).toHaveBeenCalledWith(
            res.locals,
            largePrisonersListed.slice(200, 201).map((prisoner) => prisoner.offenderNo)
          )
        })

        it('should render the movement slips page with the correct details', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderSummaries' does not exist on ... Remove this comment to see the full error message
          prisonApi.getOffenderSummaries = jest
            .fn()
            .mockReturnValueOnce(largePrisonersListedWithCell.slice(0, 100))
            .mockReturnValueOnce(largePrisonersListedWithCell.slice(100, 200))
            .mockReturnValueOnce(largePrisonersListedWithCell.slice(200, 201))
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
          await controller(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
          expect(res.render).toHaveBeenCalledWith('movementSlipsPage.njk', {
            appointmentDetails: {
              ...appointmentDetails,
              createdBy: 'T. User',
              prisonersListed: largePrisonersListedWithCell,
            },
          })
        })
      })
    })
  })
})
