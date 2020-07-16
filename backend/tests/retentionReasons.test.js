const { retentionReasonsFactory } = require('../controllers/retentionReasons')
const { serviceUnavailableMessage } = require('../common-messages')
const config = require('../config')

config.app.notmEndpointUrl = '//dpsUrl/'

describe('retention reasons', () => {
  const elite2Api = {}
  const dataComplianceApi = {}
  const offenderNo = 'ABC123'

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      body: {},
      originalUrl: 'http://localhost',
      session: {
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
        data: {},
      },
      params: { offenderNo },
      flash: jest.fn(),
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }

    logError = jest.fn()

    elite2Api.getDetails = jest.fn()
    elite2Api.getAgencyDetails = jest.fn()
    dataComplianceApi.getOffenderRetentionReasons = jest.fn()
    dataComplianceApi.getOffenderRetentionRecord = jest.fn()
    dataComplianceApi.putOffenderRetentionRecord = jest.fn()

    controller = retentionReasonsFactory(elite2Api, dataComplianceApi, logError)
  })

  const mockApis = () => {
    elite2Api.getDetails.mockReturnValue({
      offenderNo,
      firstName: 'BARRY',
      lastName: 'SMITH',
      dateOfBirth: '1990-02-01',
      agencyId: 'LEI',
    })
    elite2Api.getAgencyDetails.mockReturnValue({ description: 'Leeds' })
    dataComplianceApi.getOffenderRetentionReasons.mockResolvedValue([
      {
        reasonCode: 'OTHER',
        displayName: 'Other',
        displayOrder: 1,
      },
      {
        reasonCode: 'HIGH_PROFILE',
        displayName: 'High Profile Offenders',
        displayOrder: 0,
      },
    ])
    dataComplianceApi.getOffenderRetentionRecord.mockResolvedValue({
      etag: '"0"',
      userId: 'user1',
      modifiedDateTime: '2020-02-01T03:04:05.987654',
      retentionReasons: [
        {
          reasonCode: 'OTHER',
          reasonDetails: 'Some other reason',
        },
      ],
    })
  }

  const expectedPageDetails = () => ({
    agency: 'Leeds',
    formAction: '/offenders/ABC123/retention-reasons',
    lastUpdate: {
      user: 'user1',
      timestamp: '01/02/2020 - 03:04',
      version: '"0"',
    },
    offenderUrl: '/prisoner/ABC123',
    offenderBasics: {
      offenderNo: 'ABC123',
      firstName: 'BARRY',
      lastName: 'SMITH',
      dateOfBirth: '01/02/1990',
    },
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      beforeEach(() => {
        mockApis()
      })

      it('should make the correct calls for information and render the correct template', async () => {
        await controller.index(req, res)

        expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
        expect(elite2Api.getAgencyDetails).toHaveBeenCalledWith(res.locals, 'LEI')
        expect(res.render).toHaveBeenCalledWith('retentionReasons.njk', {
          retentionReasons: [
            {
              reasonCode: 'HIGH_PROFILE',
              displayName: 'High Profile Offenders',
              displayOrder: 0,
              alreadySelected: false,
              details: undefined,
            },
            {
              reasonCode: 'OTHER',
              displayName: 'Other',
              displayOrder: 1,
              alreadySelected: true,
              details: 'Some other reason',
            },
          ],
          ...expectedPageDetails(),
        })
      })
    })

    describe('when there are API errors', () => {
      beforeEach(() => {
        elite2Api.getDetails.mockRejectedValue(new Error('Network error'))
        dataComplianceApi.getOffenderRetentionReasons.mockResolvedValue([])
      })

      it('should render the error template', async () => {
        await controller.index(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: `/offenders/${offenderNo}/retention-reasons` })
      })
    })
  })

  describe('post', () => {
    describe('when there are no errors', () => {
      beforeEach(() => {
        req.body = {
          version: '"0"',
          'reasons[0][reasonCode]': 'HIGH_PROFILE',
          'reasons[1][reasonCode]': 'OTHER',
          'reasons[1][reasonDetails]': 'Some other reason',
        }
        dataComplianceApi.putOffenderRetentionRecord.mockResolvedValue({})
      })

      it('should make a put request to data compliance service', async () => {
        await controller.post(req, res)

        const expectedRequest = {
          retentionReasons: [
            { reasonCode: 'HIGH_PROFILE' },
            { reasonCode: 'OTHER', reasonDetails: 'Some other reason' },
          ],
        }
        expect(dataComplianceApi.putOffenderRetentionRecord).toHaveBeenCalledWith(
          {},
          offenderNo,
          expectedRequest,
          '"0"'
        )
      })
    })

    describe('when there are validation errors', () => {
      beforeEach(() => {
        mockApis()
      })

      it('should re-render selected reason with an error if details empty', async () => {
        req.body = {
          version: '"0"',
          'reasons[0][reasonCode]': 'HIGH_PROFILE',
          'reasons[1][reasonCode]': 'OTHER',
          'reasons[1][reasonDetails]': '',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('retentionReasons.njk', {
          errors: [{ text: 'Enter more detail', href: `#more-detail-OTHER` }],
          retentionReasons: [
            {
              reasonCode: 'HIGH_PROFILE',
              displayName: 'High Profile Offenders',
              displayOrder: 0,
              alreadySelected: true,
              details: undefined,
            },
            {
              reasonCode: 'OTHER',
              displayName: 'Other',
              displayOrder: 1,
              alreadySelected: true,
              details: '',
            },
          ],
          ...expectedPageDetails(),
        })
      })

      it('should re-render selected reason with an error if details too short', async () => {
        req.body = {
          version: '"0"',
          'reasons[0][reasonCode]': 'HIGH_PROFILE',
          'reasons[1][reasonCode]': 'OTHER',
          'reasons[1][reasonDetails]': '   a   ',
        }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith('retentionReasons.njk', {
          errors: [{ text: 'Enter more detail', href: `#more-detail-OTHER` }],
          retentionReasons: [
            {
              reasonCode: 'HIGH_PROFILE',
              displayName: 'High Profile Offenders',
              displayOrder: 0,
              alreadySelected: true,
              details: undefined,
            },
            {
              reasonCode: 'OTHER',
              displayName: 'Other',
              displayOrder: 1,
              alreadySelected: true,
              details: '   a   ',
            },
          ],
          ...expectedPageDetails(),
        })
      })
    })

    describe('when there are API errors', () => {
      beforeEach(() => {
        req.body = {
          version: '"0"',
          'reasons[0][reasonCode]': 'HIGH_PROFILE',
        }
        dataComplianceApi.putOffenderRetentionRecord.mockRejectedValue(new Error('Network error'))
      })

      it('should render the error template', async () => {
        await controller.post(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: `/offenders/${offenderNo}/retention-reasons` })
      })
    })
  })
})
