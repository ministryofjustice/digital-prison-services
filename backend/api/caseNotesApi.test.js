const nock = require('nock')

const clientFactory = require('./oauthEnabledClient')
const { caseNotesApiFactory } = require('./caseNotesApi')

const hostname = 'http://localhost:8080'

describe('caseNoteApi tests', () => {
  const client = clientFactory({ baseUrl: `${hostname}`, timeout: 2000 })
  const caseNoteAPi = caseNotesApiFactory(client)
  const mock = nock(hostname)

  afterEach(() => {
    nock.cleanAll()
  })

  describe('GET requests', () => {
    it('Extracts GET response data', async () => {
      mock.get('/case-notes/types').reply(200, { test: 'test' })
      const data = await caseNoteAPi.getCaseNoteTypes({}, 'test')
      expect(data).toEqual({ test: 'test' })
    })
  })

  describe('GET case notes request', () => {
    it('Maps a GET case-notes response status of 404 to a null response', async () => {
      mock.get('/case-notes/1234?size=&page=&type=&subType=&startDate=&endDate=').reply(404)
      const result = await caseNoteAPi.getCaseNotes({}, 1234, {})
      expect(result).toEqual({})
    })

    it('throws an exception for a GET case-notes response status of 401 ', async () => {
      mock.get('/case-notes/1234?size=&page=&type=&subType=&startDate=&endDate=').reply(401)

      await expect(caseNoteAPi.getCaseNotes({}, 1234, {})).rejects.toThrow('Unauthorized')
    })

    it('Should set response headers for page-limit page-offset and total-records', async () => {
      mock
        .get('/case-notes/1234')
        .query({
          size: 10,
          page: 1,
          type: 'GEN',
          subType: 'BOB',
          startDate: '2019-02-20T00:00:00',
          endDate: '2019-02-21T23:59:59',
        })
        .reply(200, {
          pageable: {
            pageSize: 10,
            offset: 10,
          },
          totalElements: 20,
        })

      const context = {}
      await caseNoteAPi.getCaseNotes(context, 1234, {
        perPage: 10,
        pageNumber: 1,
        type: 'GEN',
        subType: 'BOB',
        startDate: '20/02/2019',
        endDate: 'endDate":"21/02/2019',
      })
      expect(context).toEqual({
        responseHeaders: {
          'page-limit': '10',
          'page-offset': '10',
          'total-records': '20',
        },
      })
    })

    describe('format query parameters', () => {
      it('Should format date and add time of start of day and end of day', async () => {
        mock
          .get('/case-notes/1234')
          .query({
            size: null,
            page: null,
            type: null,
            subType: null,
            startDate: '2019-02-20T00:00:00',
            endDate: '2019-02-21T23:59:59',
          })
          .reply(200, { test: 'test' })

        const result = await caseNoteAPi.getCaseNotes({}, 1234, {
          perPage: null,
          pageNumber: null,
          type: null,
          subType: null,
          startDate: '20/02/2019',
          endDate: '21/02/2019',
        })
        expect(result).toEqual({ test: 'test' })
      })

      it('Should format date and add time of start of day', async () => {
        mock
          .get('/case-notes/1234')
          .query({
            size: null,
            page: null,
            type: null,
            subType: null,
            startDate: '2019-02-20T00:00:00',
            endDate: null,
          })
          .reply(200, { test: 'test' })

        const result = await caseNoteAPi.getCaseNotes({}, 1234, {
          perPage: null,
          pageNumber: null,
          type: null,
          subType: null,
          startDate: '20/02/2019',
          endDate: null,
        })
        expect(result).toEqual({ test: 'test' })
      })

      it('Should format dates and pass all query parameters', async () => {
        mock
          .get('/case-notes/1234')
          .query({
            size: 10,
            page: 1,
            type: 'GEN',
            subType: 'BOB',
            startDate: '2019-02-20T00:00:00',
            endDate: '2019-02-21T23:59:59',
          })
          .reply(200, { test: 'test' })

        const result = await caseNoteAPi.getCaseNotes({}, 1234, {
          perPage: 10,
          pageNumber: 1,
          type: 'GEN',
          subType: 'BOB',
          startDate: '20/02/2019',
          endDate: 'endDate":"21/02/2019',
        })
        expect(result).toEqual({ test: 'test' })
      })
    })
  })

  describe('POST requests', () => {
    it('Extracts POST response data', async () => {
      mock.post('/case-notes/1234').reply(200, { test: 'test' })
      const data = await caseNoteAPi.addCaseNote({}, '1234')
      expect(data).toEqual({ test: 'test' })
    })

    it('Sends post data', async () => {
      mock.post('/case-notes/1234', { test: 'test' }).reply(200, {})
      await caseNoteAPi.addCaseNote({}, 1234, { test: 'test' })
    })
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
