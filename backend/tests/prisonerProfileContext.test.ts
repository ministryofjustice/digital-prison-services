import getContext from '../controllers/prisonerProfile/prisonerProfileContext'

const res = {
  locals: {
    user: { activeCaseLoad: { caseLoadId: 'MDI' }, allCaseloads: [{ caseLoadId: 'MDI' }] },
  },
}

const userRole = {
  roleCode: 'POM',
}

const oauthApi = { userRoles: jest.fn().mockReturnValue([]) }

describe('Prisoner Profile Contexts', () => {
  it('returns user context', async () => {
    const context = getContext({ res, oauthApi, systemContext: null, prisonerSearchDetails: null })

    expect(context).toEqual({ context: res.locals, overrideAccess: false })
  })

  it('POM user and non restricted patient returns user context', async () => {
    oauthApi.userRoles.mockReturnValue([userRole])

    const context = getContext({ res, oauthApi, systemContext: null, prisonerSearchDetails: {} })

    expect(context).toEqual({ context: res.locals, overrideAccess: false })
  })

  it('POM user and restricted patient returns system context', async () => {
    oauthApi.userRoles.mockReturnValue([userRole])

    const systemContext = { token: 'system-1' }
    const context = getContext({
      res,
      oauthApi,
      systemContext,
      prisonerSearchDetails: { restrictedPatient: true, supportingPrisonId: 'MDI' },
    })

    expect(context).toEqual({ context: systemContext, overrideAccess: true })
  })
})
