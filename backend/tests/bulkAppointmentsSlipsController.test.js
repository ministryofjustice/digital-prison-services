Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const { largePrisonersListed, largePrisonersListedWithCell } = require('./bulkAppointmentsTestData')
const bulkAppointmentsSlipsRouter = require('../routes/appointments/bulkAppointmentsSlipsRouter')
const { serviceUnavailableMessage } = require('../common-messages')

let req
let res
let logError
let controller

beforeEach(() => {
  elite2Api.getOffenderSummaries = jest.fn()
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
  res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
  logError = jest.fn()
  controller = bulkAppointmentsSlipsRouter({ elite2Api, logError })
})

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
        await controller(req, res)

        expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
      })
    })

    describe('and there is a small amount of data', () => {
      beforeEach(() => {
        req.session.appointmentSlipsData = { appointmentDetails, prisonersListed }
      })

      it('should call the correct endpoint for the extra required offender information', async () => {
        await controller(req, res)

        expect(elite2Api.getOffenderSummaries).toHaveBeenCalledWith(res.locals, [
          'G1683VN',
          'G4803UT',
          'G4346UT',
          'G5402VR',
        ])
      })

      it('should render the movement slips page with the correct details', async () => {
        elite2Api.getOffenderSummaries = jest
          .fn()
          .mockReturnValue([
            { offenderNo: 'G1683VN', assignedLivingUnitDesc: 'CELL 1' },
            { offenderNo: 'G4803UT', assignedLivingUnitDesc: 'CELL 2' },
            { offenderNo: 'G4346UT', assignedLivingUnitDesc: 'CELL 3' },
            { offenderNo: 'G5402VR', assignedLivingUnitDesc: 'CELL 4' },
          ])

        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('movementSlipsPage.njk', {
          appointmentDetails: {
            ...appointmentDetails,
            createdBy: 'T User',
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

      describe('but there is an issue getting additional offender details', () => {
        const genericErrorMessage = 'There has been an error'
        beforeEach(() => {
          elite2Api.getOffenderSummaries = jest.fn().mockRejectedValue(new Error(genericErrorMessage))
          req.session.appointmentSlipsData = { appointmentDetails, prisonersListed: largePrisonersListed }
        })

        it('should log an error and render the error page', async () => {
          await controller(req, res)

          expect(logError).toBeCalledWith(
            '/bulk-appointments/confirm-appointment/',
            new Error(genericErrorMessage),
            serviceUnavailableMessage
          )
          expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
        })
      })
    })

    describe('and there is a large amount of data', () => {
      beforeEach(() => {
        req.session.appointmentSlipsData = { appointmentDetails, prisonersListed: largePrisonersListed }
      })

      it('should call the correct endpoint the correct amount of times for the extra required offender information', async () => {
        await controller(req, res)

        expect(elite2Api.getOffenderSummaries).toHaveBeenCalledWith(
          res.locals,
          largePrisonersListed.slice(0, 100).map(prisoner => prisoner.offenderNo)
        )
        expect(elite2Api.getOffenderSummaries).toHaveBeenCalledWith(
          res.locals,
          largePrisonersListed.slice(100, 200).map(prisoner => prisoner.offenderNo)
        )
        expect(elite2Api.getOffenderSummaries).toHaveBeenCalledWith(
          res.locals,
          largePrisonersListed.slice(200, 201).map(prisoner => prisoner.offenderNo)
        )
      })

      it('should render the movement slips page with the correct details', async () => {
        elite2Api.getOffenderSummaries = jest
          .fn()
          .mockReturnValueOnce(largePrisonersListedWithCell.slice(0, 100))
          .mockReturnValueOnce(largePrisonersListedWithCell.slice(100, 200))
          .mockReturnValueOnce(largePrisonersListedWithCell.slice(200, 201))
        await controller(req, res)

        expect(res.render).toHaveBeenCalledWith('movementSlipsPage.njk', {
          appointmentDetails: {
            ...appointmentDetails,
            createdBy: 'T User',
            prisonersListed: largePrisonersListedWithCell,
          },
        })
      })
    })
  })
})
