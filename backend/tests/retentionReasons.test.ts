// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'retentionR... Remove this comment to see the full error message
const { retentionReasonsFactory } = require('../controllers/retentionReasons')

describe('retention reasons', () => {
  const prisonApi = {}
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
    res = { locals: {}, render: jest.fn(), redirect: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionReasons' does not ex... Remove this comment to see the full error message
    dataComplianceApi.getOffenderRetentionReasons = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
    dataComplianceApi.getOffenderRetentionRecord = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'putOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
    dataComplianceApi.putOffenderRetentionRecord = jest.fn()

    // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
    controller = retentionReasonsFactory(prisonApi, dataComplianceApi, logError)
  })

  const mockApis = () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockReturnValue({
      offenderNo,
      firstName: 'BARRY',
      lastName: 'SMITH',
      dateOfBirth: '1990-02-01',
      agencyId: 'LEI',
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails.mockReturnValue({ description: 'Leeds' })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionReasons' does not ex... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
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

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
        expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
        expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith(res.locals, 'LEI')
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'putOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'putOffenderRetentionRecord' does not exi... Remove this comment to see the full error message
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
  })
})
