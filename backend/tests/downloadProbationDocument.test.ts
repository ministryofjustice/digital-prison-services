import { downloadProbationDocumentFactory } from '../controllers/downloadProbationDocument'
import { deliusIntegrationApiFactory } from '../api/deliusIntegrationApi'

describe('Download probation documents', () => {
  const oauthApi = {}
  const hmppsManageUsersApi = {}
  const prisonApi = {}
  const deliusIntegrationApi = {}
  const systemOauthClient = {}

  describe('Controller', () => {
    const mockReq = {
      flash: jest.fn().mockReturnValue([]),
      originalUrl: '/offenders/G9542VP/probation-documents/123/download',
    }
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
      hmppsManageUsersApi.currentUser = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{}'... Remove this comment to see the full error message
      prisonApi.userCaseLoads = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'... Remove this comment to see the full error message
      prisonApi.getDetails = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'downloadDocument' does not exist on type '{}'... Remove this comment to see the full error message
      deliusIntegrationApi.downloadDocument = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      systemOauthClient.getClientCredentialsTokens = jest.fn()

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      systemOauthClient.getClientCredentialsTokens.mockReturnValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'POM' }])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
      hmppsManageUsersApi.currentUser.mockReturnValue({ username: 'USER_ADM', activeCaseLoadId: 'MDI' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userCaseLoads' does not exist on type '{}'... Remove this comment to see the full error message
      prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }])
      // @ts-expect-error ts-migrate(2339)
      prisonApi.getDetails.mockReturnValue({
        agencyId: 'LEI',
      })
    })

    describe('when downloading document', () => {
      const res = {}
      let req
      let page

      beforeEach(() => {
        page = downloadProbationDocumentFactory(
          oauthApi,
          hmppsManageUsersApi,
          deliusIntegrationApi,
          systemOauthClient,
          prisonApi
        ).downloadDocument
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
        res.render = jest.fn()
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'locals' does not exist on type '{}'.
        res.locals = {}

        req = { ...mockReq, params: { offenderNo: 'G9542VP', documentId: '123' } }
      })

      it('should pipe offender document', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
        systemOauthClient.getClientCredentialsTokens.mockReturnValue({ token: 'abc' })

        await page(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'downloadDocument' does not exist on ... Remove this comment to see the full error message
        expect(deliusIntegrationApi.downloadDocument).toHaveBeenCalledWith(
          { token: 'abc' },
          {
            documentId: '123',
            offenderNo: 'G9542VP',
            res,
          }
        )
      })

      describe('access to the download is based on role and caseload', () => {
        it('should allow download if prisoner in one of my other caseloads but not the active one', async () => {
          // @ts-expect-error ts-migrate(2339)
          prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }])
          // @ts-expect-error ts-migrate(2339)
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
          // @ts-expect-error ts-migrate(2339)
          prisonApi.getDetails.mockReturnValue({
            agencyId: 'LEI',
          })

          await page(req, res)

          // @ts-expect-error ts-migrate(2339) FIXME: Property 'downloadDocument' does not exist on ... Remove this comment to see the full error message
          expect(deliusIntegrationApi.downloadDocument).toHaveBeenCalled()
        })
        it('should render page with unavailable message with missing role', async () => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
          oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOME_OTHER_ROLE' }])

          const error = new Error('You do not have the correct role or caseload to access this page')

          await expect(page(req, res)).rejects.toThrowError(error)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'locals' does not exist on type '{}'.
          expect(res.locals.redirectUrl).toBe('/offenders/G9542VP/probation-documents')
        })

        it('should render page with unavailable message when prisoner is not in any of my caseloads', async () => {
          // @ts-expect-error ts-migrate(2339)
          prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }])
          // @ts-expect-error ts-migrate(2339)
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
          // @ts-expect-error ts-migrate(2339)
          prisonApi.getDetails.mockReturnValue({
            agencyId: 'BXI',
          })

          const error = new Error('You do not have the correct role or caseload to access this page')

          await expect(page(req, res)).rejects.toThrowError(error)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'locals' does not exist on type '{}'.
          expect(res.locals.redirectUrl).toBe('/offenders/G9542VP/probation-documents')
        })

        it('should render page with unavailable message when prisoner is now out of prison', async () => {
          // @ts-expect-error ts-migrate(2339)
          prisonApi.userCaseLoads.mockResolvedValue([{ caseLoadId: 'MDI' }, { caseLoadId: 'LEI' }])
          // @ts-expect-error ts-migrate(2339)
          hmppsManageUsersApi.currentUser.mockReturnValue({ staffId: 111, activeCaseLoadId: 'MDI' })
          // @ts-expect-error ts-migrate(2339)
          prisonApi.getDetails.mockReturnValue({
            agencyId: 'OUT',
          })

          const error = new Error('You do not have the correct role or caseload to access this page')

          await expect(page(req, res)).rejects.toThrowError(error)
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'locals' does not exist on type '{}'.
          expect(res.locals.redirectUrl).toBe('/offenders/G9542VP/probation-documents')
        })
      })
    })
  })
})
