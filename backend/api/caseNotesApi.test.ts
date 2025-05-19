import nock from 'nock'
import clientFactory from './oauthEnabledClient'

import { caseNotesApiFactory } from './caseNotesApi'

const hostname = 'http://localhost:8080'

describe('caseNoteApi tests', () => {
  const client = clientFactory({ baseUrl: `${hostname}`, timeout: 2000 })
  const caseNoteAPi = caseNotesApiFactory(client)
  const mock = nock(hostname)

  afterEach(() => {
    nock.cleanAll()
  })

  describe('PUT requests', () => {
    it('Extracts PUT response data', async () => {
      mock.put('/case-notes/1234/12').reply(200, { test: 'test' })
      const data = await caseNoteAPi.amendCaseNote({}, '1234', 12)
      expect(data).toEqual({ test: 'test' })
    })

    it('Sends post data', async () => {
      mock.put('/case-notes/1234/12', { test: 'test' }).reply(200, {})
      await caseNoteAPi.amendCaseNote({}, 1234, 12, { test: 'test' })
    })
  })
})
