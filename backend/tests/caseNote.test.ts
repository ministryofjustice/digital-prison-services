import config from '../config'
import caseNoteCtrl from '../controllers/caseNote'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const prisonApi = { getDetails: {} }
const restrictedPatientApi = {}
const systemOauthClient = { getClientCredentialsTokens: () => ({ access_token: 'CLIENT_TOKEN' }) }
const oauthApi = {}

const { recordIncentiveLevelInterruption } = caseNoteCtrl.caseNoteFactory({
  prisonApi,
  oauthApi,
  systemOauthClient,
  restrictedPatientApi,
})

jest.mock('../logError', () => ({
  logError: jest.fn(),
}))

describe('case note management', () => {
  let res

  const mockSession = { userDetails: { activeCaseLoadId: 'LEI', authSource: 'nomis' } }
  const mockCreateReq = {
    flash: jest.fn().mockReturnValue([]),
    originalUrl: '/add-case-note/',
    get: jest.fn(),
    body: {},
    session: { ...mockSession },
  }
  const getDetailsResponse = {
    bookingId: 1234,
    firstName: 'Test',
    lastName: 'User',
  }

  const offenderNo = 'ABC123'

  beforeEach(() => {
    res = { render: jest.fn(), redirect: jest.fn(), locals: {} }
    prisonApi.getDetails = jest.fn().mockReturnValue(getDetailsResponse)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.userRoles = jest.fn().mockReturnValue([])
  })

  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockRestore()

    mockCreateReq.flash.mockReset()
  })

  describe('recordIncentiveLevelInterruption()', () => {
    it('should render the interruption page', async () => {
      const req = { ...mockCreateReq, params: { offenderNo } }

      await recordIncentiveLevelInterruption(req, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/recordIncentiveLevelInterruption.njk',
        expect.objectContaining({
          offenderDetails: {
            name: 'Test User',
            offenderNo: 'ABC123',
            profileUrl: '/prisoner/ABC123',
          },
          caseNotesUrl: '/prisoner/ABC123/case-notes',
          recordIncentiveLevelUrl: `${config.apis.incentives.ui_url}/incentive-reviews/prisoner/ABC123/change-incentive-level`,
        })
      )
    })
  })
})
