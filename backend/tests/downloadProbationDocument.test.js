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
      oauthApi.userRoles = jest.fn()
      oauthApi.currentUser = jest.fn()
      communityApi.pipeOffenderDocument = jest.fn()
      systemOauthClient.getClientCredentialsTokens = jest.fn()

      systemOauthClient.getClientCredentialsTokens.mockReturnValue({})
      oauthApi.userRoles.mockReturnValue([{ roleCode: 'POM' }])
      oauthApi.currentUser.mockReturnValue({ username: 'USER_ADM' })
    })

    describe('when downloading document', () => {
      const res = {}
      let req
      let page

      beforeEach(() => {
        page = downloadProbationDocumentFactory(oauthApi, communityApi, systemOauthClient).downloadDocument
        res.render = jest.fn()

        req = { ...mockReq, params: { offenderNo: 'G9542VP', documentId: '123' } }
      })

      it('should pipe offender document', async () => {
        systemOauthClient.getClientCredentialsTokens.mockReturnValue({ token: 'abc' })

        await page(req, res)

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
        oauthApi.userRoles.mockReturnValue([{ roleCode: 'SOME_OTHER_ROLE' }])

        await page(req, res)

        expect(res.render).toHaveBeenCalledWith('error.njk', {
          url: '/offenders/G9542VP/probation-documents',
        })
      })
    })
  })
})
