Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const { globalSearch } = require('../controllers/globalSearch').globalSearchFactory(elite2Api)

beforeEach(() => {
  elite2Api.globalSearch = jest.fn()
})

describe('Global Search controller', async () => {
  it('Should return no results as an empty array', async () => {
    elite2Api.globalSearch.mockReturnValue([])

    const response = await globalSearch({}, 'text')
    expect(response).toEqual([])

    expect(elite2Api.globalSearch).toHaveBeenCalled()

    expect(elite2Api.globalSearch.mock.calls[0][1]).toEqual('')
    expect(elite2Api.globalSearch.mock.calls[0][2]).toEqual('text')
    expect(elite2Api.globalSearch.mock.calls[0][3]).toEqual('')
  })

  it('Should return results', async () => {
    const apiResponse = createResponse()
    elite2Api.globalSearch.mockReturnValue(apiResponse)

    const response = await globalSearch({}, 'text')
    expect(response).toEqual(apiResponse)
  })

  it('Should detect an offenderId', async () => {
    const apiResponse = createResponse()
    elite2Api.globalSearch.mockReturnValue(apiResponse)

    const offenderNo = 'Z4444YY'
    await globalSearch({}, offenderNo)
    expect(elite2Api.globalSearch.mock.calls[0][1]).toEqual(offenderNo)
    expect(elite2Api.globalSearch.mock.calls[0][2]).toEqual('')
    expect(elite2Api.globalSearch.mock.calls[0][3]).toEqual('')
  })

  it('Should detect 2 words', async () => {
    const apiResponse = createResponse()
    elite2Api.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, 'last first')
    expect(elite2Api.globalSearch.mock.calls[0][1]).toEqual('')
    expect(elite2Api.globalSearch.mock.calls[0][2]).toEqual('last')
    expect(elite2Api.globalSearch.mock.calls[0][3]).toEqual('first')
  })

  it('Should ignore leading and trailing whitespace', async () => {
    const apiResponse = createResponse()
    elite2Api.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, '  word  ')
    expect(elite2Api.globalSearch.mock.calls[0][1]).toEqual('')
    expect(elite2Api.globalSearch.mock.calls[0][2]).toEqual('word')
    expect(elite2Api.globalSearch.mock.calls[0][3]).toEqual('')
  })
})

function createResponse() {
  return [
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      latestLocation: 'Leeds HMP',
      dateOfBirth: '1977-10-15',
    },
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      latestLocation: 'Moorland HMP',
      dateOfBirth: '1976-09-15',
    },
  ]
}
