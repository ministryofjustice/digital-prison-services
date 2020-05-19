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
