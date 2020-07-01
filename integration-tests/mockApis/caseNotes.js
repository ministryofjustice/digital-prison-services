const { getFor } = require('./wiremock')

const caseNoteTypes = [
  {
    code: 'OBSERVE',
    description: 'Observations',
    activeFlag: 'Y',
    source: 'OCNS',
    subCodes: [
      {
        code: 'test',
        description: 'Test',
      },
    ],
  },
]

module.exports = {
  stubHealth: (status = 200) => {
    return getFor({
      request: {
        method: 'GET',
        url: '/api/health/ping',
      },
      response: {
        status,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        body: 'pong',
      },
    })
  },
  stubCaseNotes: body => {
    return getFor({
      urlPath: '/case-notes/A12345',
      body,
    })
  },
  stubCaseNoteTypes: () => {
    return getFor({
      urlPattern: '/case-notes/types',
      body: caseNoteTypes,
    })
  },
}
