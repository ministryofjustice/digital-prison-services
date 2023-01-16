import getContext from '../controllers/prisonerProfile/prisonerProfileContext'

const offenderNo = '1234'
const req = { params: { offenderNo }, session: { userDetails: { username: 'ITAG_USER' } } }
const res = {
  locals: {
    user: { activeCaseLoad: { caseLoadId: 'MDI' }, allCaseloads: [] },
  },
}

const userRole = {
  roleCode: 'POM',
}

const oauthApi = {}
const systemOauthClient = {}
const restrictedPatientApi = {}

describe('Prisoner Profile Contexts', () => {
  it('returns user context', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.userRoles = jest.fn().mockReturnValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isCaseLoadRestrictedPatient' does not exist on type '{}'... Remove this comment to see the full error message
    restrictedPatientApi.getRestrictedPatientDetails = jest.fn().mockResolvedValue(undefined)

    const context = await getContext({ offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi })

    expect(context).toEqual({ context: res.locals, restrictedPatientDetails: undefined })
  })

  it('POM user and non restricted patient returns user context', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.userRoles = jest.fn().mockReturnValue([userRole])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isCaseLoadRestrictedPatient' does not exist on type '{}'... Remove this comment to see the full error message
    restrictedPatientApi.getRestrictedPatientDetails = jest.fn().mockResolvedValue(undefined)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exist on type '{}'... Remove this comment to see the full error message
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({})

    const context = await getContext({ offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi })

    expect(context).toEqual({ context: res.locals, restrictedPatientDetails: undefined })
  })

  it('POM user and restricted patient returns system context', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.userRoles = jest.fn().mockReturnValue([userRole])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isCaseLoadRestrictedPatient' does not exist on type '{}'... Remove this comment to see the full error message
    restrictedPatientApi.getRestrictedPatientDetails = jest
      .fn()
      .mockResolvedValue({ isCaseLoadRestrictedPatient: true, hospital: { description: 'some hospital' } })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exist on type '{}'... Remove this comment to see the full error message
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({})

    const context = await getContext({ offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi })

    expect(context).toEqual({
      context: {},
      restrictedPatientDetails: {
        isRestrictedPatient: true,
        isPomCaseLoadRestrictedPatient: true,
        hospital: 'some hospital',
      },
    })
  })

  it('normal user and restricted patient returns system context', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.userRoles = jest.fn().mockReturnValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isCaseLoadRestrictedPatient' does not exist on type '{}'... Remove this comment to see the full error message
    restrictedPatientApi.getRestrictedPatientDetails = jest
      .fn()
      .mockResolvedValue({ isCaseLoadRestrictedPatient: true, hospital: { description: 'some hospital' } })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exist on type '{}'... Remove this comment to see the full error message
    systemOauthClient.getClientCredentialsTokens = jest.fn().mockResolvedValue({})

    const context = await getContext({ offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi })

    expect(context).toEqual({
      context: {},
      restrictedPatientDetails: {
        isRestrictedPatient: true,
        isPomCaseLoadRestrictedPatient: false,
        hospital: 'some hospital',
      },
    })
  })
})
