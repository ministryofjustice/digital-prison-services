import { csvParserService } from '../csv-parser'
import { offenderLoaderFactory } from '../controllers/offender-loader'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const elite2Api = {}
const fs = {}
let isBinaryFileSync
const { logError } = require('../logError')
const {
  csvBulkOffenderUpload,
  postAndParseCsvOffenderList,
} = require('../controllers/bulkAppointmentsUpload').bulkAppointmentsUploadFactory(
  csvParserService({ fs, isBinaryFileSync }),
  offenderLoaderFactory(elite2Api),
  logError
)

describe('bulk appointments upload', () => {
  const appointmentDetails = {
    appointmentType: 'Cardio',
    location: 'Gym',
    startTime: '2019-09-23T15:30:00',
    endTime: '2019-09-30T16:30:00',
    comment: 'Activity comment',
  }

  const mockReq = {
    originalUrl: '/bulk-appointments/upload-file/',
  }

  const mockRes = { render: jest.fn(), redirect: jest.fn(), locals: {} }

  describe('index', () => {
    describe('when there are no errors', () => {
      const req = { ...mockReq, session: { data: { ...appointmentDetails } }, flash: jest.fn() }
      const res = { ...mockRes }

      it('should render the appointments csv upload page', async () => {
        await csvBulkOffenderUpload(req, res)

        expect(res.render).toBeCalledWith('uploadOffenders.njk', {
          appointmentDetails,
          errors: undefined,
          title: 'Upload a CSV File',
        })
      })
    })

    describe('when there is an error', () => {
      const req = { ...mockReq, session: {} }
      const res = { ...mockRes }

      it('should render the error page', async () => {
        await csvBulkOffenderUpload(req, res)

        expect(res.render).toBeCalledWith('error.njk', { url: '/bulk-appointments/add-appointment-details' })
      })
    })
  })
})
