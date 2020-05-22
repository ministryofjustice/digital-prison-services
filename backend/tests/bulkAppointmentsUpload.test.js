const { bulkAppointmentsUploadFactory } = require('../controllers/appointments/bulkAppointmentsUpload')

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const logError = jest.fn()
const csvParser = {}
const offenderLoader = {}
const elite2api = {}
const controller = bulkAppointmentsUploadFactory(csvParser, offenderLoader, elite2api, logError)

describe('bulk appointments upload', () => {
  const appointmentDetails = {
    appointmentType: 'Cardio',
    location: 'Gym',
    startTime: '2019-09-23T15:30:00',
    endTime: '2019-09-30T16:30:00',
    comment: 'Activity comment',
    date: '23/09/2019',
  }

  let req
  let res

  beforeEach(() => {
    req = {
      originalUrl: '/bulk-appointments/upload-file/',
      session: {
        data: { ...appointmentDetails },
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
      },
      flash: jest.fn(),
      files: { file: 'test' },
    }
    res = { locals: {}, end: jest.fn() }
    res.render = jest.fn()
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      it('should render the appointments csv upload page', async () => {
        await controller.index(req, res)

        expect(res.render).toBeCalledWith('uploadOffenders.njk', {
          appointmentDetails: { ...appointmentDetails, date: '2019-09-23T00:00:00' },
          errors: undefined,
        })
      })
    })

    describe('when there is no session data', () => {
      beforeEach(() => {
        req = { originalUrl: '/bulk-appointments/upload-file/', session: {} }
        res = { locals: {}, redirect: jest.fn() }
        res.render = jest.fn()
      })

      it('should redirect to start when session is invalid', async () => {
        await controller.index(req, res)

        expect(res.redirect).toBeCalledWith('/bulk-appointments/add-appointment-details')
      })
    })
  })

  describe('post', () => {
    beforeEach(() => {
      csvParser.loadAndParseCsvFile = jest.fn()
      offenderLoader.loadFromCsvContent = jest.fn()
      elite2api.getLocation = jest.fn()
      elite2api.getLocation.mockImplementation((context, livingUnitId) => {
        return { description: `${livingUnitId}_cell_no` }
      })
    })
    let fileContent = [['Prison number'], ['G1683VN'], ['G4803UT'], ['G4346UT']]

    const prisonerList = [
      {
        bookingId: 747272,
        bookingNo: 'K00278',
        offenderNo: 'G1683VN',
        firstName: 'Elton',
        lastName: 'Abbatiello',
        agencyId: 'MDI',
        assignedLivingUnitId: 26113,
        dateOfBirth: '1980-09-08',
      },
      {
        bookingId: 1053607,
        bookingNo: 'V37486',
        offenderNo: 'G4803UT',
        firstName: 'Bobby',
        middleName: 'Aurawn',
        lastName: 'Abdulkadir',
        agencyId: 'MDI',
        assignedLivingUnitId: 25764,
        dateOfBirth: '1993-11-11',
      },
      {
        bookingId: 1054729,
        bookingNo: 'V38608',
        offenderNo: 'G4346UT',
        firstName: 'Dewey',
        lastName: 'Affolter',
        agencyId: 'MDI',
        assignedLivingUnitId: 25990,
        dateOfBirth: '1946-05-10',
      },
    ]

    describe('when there are no errors', () => {
      it('should parse the CSV data and redirect to the confirm page', async () => {
        csvParser.loadAndParseCsvFile.mockImplementation(() => Promise.resolve(fileContent))
        offenderLoader.loadFromCsvContent.mockReturnValue(prisonerList)
        res.redirect = jest.fn()

        await controller.post(req, res)

        expect(req.session.data).toEqual({
          appointmentType: 'Cardio',
          location: 'Gym',
          startTime: '2019-09-23T15:30:00',
          endTime: '2019-09-30T16:30:00',
          date: '23/09/2019',
          comment: 'Activity comment',
          prisonersListed: [
            {
              bookingId: 747272,
              offenderNo: 'G1683VN',
              firstName: 'Elton',
              lastName: 'Abbatiello',
              cellNo: '26113_cell_no',
            },
            {
              bookingId: 1053607,
              offenderNo: 'G4803UT',
              firstName: 'Bobby',
              lastName: 'Abdulkadir',
              cellNo: '25764_cell_no',
            },
            {
              bookingId: 1054729,
              offenderNo: 'G4346UT',
              firstName: 'Dewey',
              lastName: 'Affolter',
              cellNo: '25990_cell_no',
            },
          ],
          prisonersNotFound: [],
          prisonersDuplicated: [],
        })

        expect(res.redirect).toBeCalledWith('/bulk-appointments/confirm-appointments')
      })
    })

    describe('when some of the offender numbers cannot be found from the uploaded CSV file', () => {
      beforeEach(() => {
        fileContent = [['G1683VN'], ['G4803UT'], ['BADNUMBER']]
      })
      it('should redirect to the invalid numbers page with the correct data', async () => {
        csvParser.loadAndParseCsvFile.mockImplementation(() => Promise.resolve(fileContent))
        offenderLoader.loadFromCsvContent.mockReturnValue(prisonerList)
        res.redirect = jest.fn()

        await controller.post(req, res)
        expect(req.session.data).toEqual(expect.objectContaining({ prisonersNotFound: ['BADNUMBER'] }))
        expect(res.redirect).toBeCalledWith('/bulk-appointments/invalid-numbers')
      })
    })

    describe('when all the offender numbers cannot be found from the uploaded CSV file', () => {
      beforeEach(() => {
        fileContent = [['G1683VN'], ['G4803UT']]
      })
      it('should redirect to the no appointments added page', async () => {
        csvParser.loadAndParseCsvFile.mockImplementation(() => Promise.resolve(fileContent))
        offenderLoader.loadFromCsvContent.mockReturnValue([])
        res.redirect = jest.fn()

        await controller.post(req, res)
        expect(res.redirect).toBeCalledWith('/bulk-appointments/no-appointments-added?reason=offendersNotFound')
      })
    })

    describe('when there are duplicates found in the uploaded CSV file', () => {
      beforeEach(() => {
        fileContent = [['G1683VN'], ['G1683VN'], ['G4803UT'], ['G4803UT'], ['G4803UT']]
      })
      it('should redirect to the invalid numbers page with the correct data', async () => {
        csvParser.loadAndParseCsvFile.mockImplementation(() => Promise.resolve(fileContent))
        offenderLoader.loadFromCsvContent.mockReturnValue([])
        res.redirect = jest.fn()

        await controller.post(req, res)
        expect(req.session.data).toEqual(
          expect.objectContaining({
            prisonersDuplicated: ['G1683VN', 'G4803UT'],
          })
        )
        expect(res.redirect).toBeCalledWith('/bulk-appointments/invalid-numbers')
      })
    })

    describe('when there are errors', () => {
      beforeEach(() => {
        csvParser.loadAndParseCsvFile = jest.fn().mockImplementation(() => {
          throw new Error('There has been an error')
        })
      })
      it('should return handle errors with the csv parsing service', async () => {
        await controller.post(req, res)

        expect(logError).toBeCalledWith(
          '/bulk-appointments/upload-file/',
          new Error('There has been an error'),
          'Sorry, the service is unavailable'
        )

        expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
      })
    })
  })
})
