// @ts-expect-error ts-migrate(2306) FIXME: File 'prisonstaf... Remove this comment to see the full error message
import { downloadProbationDocumentFactory } from '../controllers/downloadProbationDocument'

describe('Download probation documents', () => {
  const oauthApi = {}
  const communityApi = {}
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
      oauthApi.currentUser = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'pipeOffenderDocument' does not exist on ... Remove this comment to see the full error message
      communityApi.pipeOffenderDocument = jest.fn()
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      systemOauthClient.getClientCredentialsTokens = jest.fn()

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getClientCredentialsTokens' does not exi... Remove this comment to see the full error message
      systemOauthClient.getClientCredentialsTokens.mockReturnValue({})
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'POM' }])
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'currentUser' does not exist on type '{}'... Remove this comment to see the full error message
      oauthApi.currentUser.mockReturnValue({ username: 'USER_ADM' })
    })

    describe('when downloading document', () => {
      const res = {}
      let req
      let page

      beforeEach(() => {
        page = downloadProbationDocumentFactory(oauthApi, communityApi, systemOauthClient).downloadDocument
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

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'pipeOffenderDocument' does not exist on ... Remove this comment to see the full error message
        expect(communityApi.pipeOffenderDocument).toHaveBeenCalledWith(
          { token: 'abc' },
          {
            documentId: '123',
            offenderNo: 'G9542VP',
            res,
          }
        )
      })

      it('should render page with unavailable message with missing role', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOME_OTHER_ROLE' }])

        const error = new Error('You do not have the correct role to access this page')

        await expect(page(req, res)).rejects.toThrowError(error)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'locals' does not exist on type '{}'.
        expect(res.locals.redirectUrl).toBe('/offenders/G9542VP/probation-documents')
      })
    })
  })
})
