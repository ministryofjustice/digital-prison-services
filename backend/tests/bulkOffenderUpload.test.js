const { bulkAppointmentsUploadFactory } = require('../controllers/bulkAppointmentsUpload')

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const logError = jest.fn()
const csvParser = {}
const offenderLoader = {}
const controller = bulkAppointmentsUploadFactory(csvParser, offenderLoader, logError)

describe('bulk appointments upload', () => {
  const appointmentDetails = {
    appointmentType: 'Cardio',
    location: 'Gym',
    startTime: '2019-09-23T15:30:00',
    endTime: '2019-09-30T16:30:00',
    comment: 'Activity comment',
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
    res = { locals: {} }
    res.render = jest.fn()
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      it('should render the appointments csv upload page', async () => {
        await controller.index(req, res)

        expect(res.render).toBeCalledWith('uploadOffenders.njk', {
          appointmentDetails,
          errors: undefined,
          title: 'Upload a CSV File',
        })
      })
    })

    describe('when there is an error', () => {
      beforeEach(() => {
        req = { originalUrl: '/bulk-appointments/upload-file/', session: {} }
        res = { locals: {} }
        res.render = jest.fn()
      })

      it('should render the error page', async () => {
        await controller.index(req, res)

        expect(res.render).toBeCalledWith('error.njk', { url: '/need-to-upload-file' })
      })
    })
  })

  describe('post', () => {
    beforeEach(() => {
      csvParser.loadAndParseCsvFile = jest.fn()
      offenderLoader.loadFromCsvContent = jest.fn()
    })
    const fileContent = [
      ['G1683VN'],
      ['G4803UT'],
      ['G4346UT'],
      ['BADNUMBER'],
      ['ANOTHERBADNUMBER'],
      ['REALLYBADNUMBER'],
    ]

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
          comment: 'Activity comment',
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
          ],
          prisonersNotFound: ['BADNUMBER', 'ANOTHERBADNUMBER', 'REALLYBADNUMBER'],
        })

        expect(res.redirect).toBeCalledWith('/bulk-appointments/confirm-appointments')
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

        expect(res.render).toBeCalledWith('error.njk', { url: '/need-to-upload-file' })
      })
    })
  })
})
