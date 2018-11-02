Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2Api = {}
const { globalSearch } = require('../controllers/globalSearch').globalSearchFactory(elite2Api)

beforeEach(() => {
  elite2Api.globalSearch = jest.fn()
  elite2Api.getLastPrison = jest.fn()
})

function createResponse() {
  return [
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      latestLocation: 'Leeds HMP',
      latestLocationId: 'LEI',
      dateOfBirth: '1977-10-15',
    },
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      latestLocationId: 'MDI',
      latestLocation: 'Moorland HMP',
      dateOfBirth: '1976-09-15',
    },
  ]
}

function createOutResponse() {
  return [
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      latestLocation: 'Leeds HMP',
      latestLocationId: 'LEI',
      dateOfBirth: '1977-10-15',
    },
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      latestLocationId: 'MDI',
      latestLocation: 'Moorland HMP',
      dateOfBirth: '1976-09-15',
    },
    {
      offenderNo: 'A1234BB',
      firstName: 'MEL',
      lastName: 'DAMP',
      latestLocationId: 'OUT',
      latestLocation: 'OUTSIDE',
      dateOfBirth: '1976-09-15',
    },
  ]
}

function createDecoratedResponse(locationText) {
  return [
    {
      offenderNo: 'A1234AC',
      firstName: 'FRED',
      lastName: 'QUIMBY',
      latestLocation: 'Leeds HMP',
      latestLocationId: 'LEI',
      dateOfBirth: '15/10/1977',
    },
    {
      offenderNo: 'A1234AA',
      firstName: 'ARTHUR',
      lastName: 'ANDERSON',
      latestLocationId: 'MDI',
      latestLocation: 'Moorland HMP',
      dateOfBirth: '15/09/1976',
    },
    {
      offenderNo: 'A1234BB',
      firstName: 'MEL',
      lastName: 'DAMP',
      latestLocationId: 'OUT',
      latestLocation: locationText,
      dateOfBirth: '15/09/1976',
    },
  ]
}

function getLastPrisonResponseReleased() {
  return [
    {
      offenderNo: 'A1234BB',
      createDateTime: '2016-05-04T09:24:46.254162',
      fromAgencyDescription: 'Near Leeds',
      toAgencyDescription: 'OUT',
      movementTypeDescription: 'Release',
      movementType: 'REL',
      directionCode: 'OUT',
    },
  ]
}

function getLastPrisonResponseCourtVisit() {
  return [
    {
      offenderNo: 'A1234BB',
      createDateTime: '2016-05-04T09:24:46.254162',
      fromAgencyDescription: 'Near Leeds',
      toAgencyDescription: 'OUT',
      movementTypeDescription: 'Court visit',
      movementType: 'CRT',
      directionCode: 'OUT',
    },
  ]
}

describe('Global Search controller', async () => {
  it('Should return no results as an empty array', async () => {
    elite2Api.globalSearch.mockReturnValue([])

    const response = await globalSearch({}, 'text')
    expect(response).toEqual([])

    expect(elite2Api.globalSearch).toHaveBeenCalled()

    expect(elite2Api.globalSearch.mock.calls[0]).toEqual([{}, '', 'text', ''])
  })

  it('Should return results', async () => {
    const apiResponse = createResponse()
    elite2Api.globalSearch.mockReturnValue(apiResponse)

    const response = await globalSearch({}, 'text')
    expect(response).toEqual(apiResponse)
  })

  it('Should add released text', async () => {
    elite2Api.globalSearch.mockReturnValue(createOutResponse())
    elite2Api.getLastPrison.mockReturnValue(getLastPrisonResponseReleased())

    const response = await globalSearch({}, 'text')
    expect(response).toEqual(createDecoratedResponse('Outside - released from Near Leeds'))
  })

  it('Should add other movement text', async () => {
    elite2Api.globalSearch.mockReturnValue(createOutResponse())
    elite2Api.getLastPrison.mockReturnValue(getLastPrisonResponseCourtVisit())

    const response = await globalSearch({}, 'text')
    expect(response).toEqual(createDecoratedResponse('Outside - Court visit'))
  })

  it('Should detect an offenderId', async () => {
    const apiResponse = createResponse()
    elite2Api.globalSearch.mockReturnValue(apiResponse)

    const offenderNo = 'Z4444YY'
    await globalSearch({}, offenderNo)
    expect(elite2Api.globalSearch.mock.calls[0]).toEqual([{}, offenderNo, '', ''])
  })

  it('Should detect 2 words', async () => {
    const apiResponse = createResponse()
    elite2Api.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, 'last first')
    expect(elite2Api.globalSearch.mock.calls[0]).toEqual([{}, '', 'last', 'first'])
  })

  it('Should ignore leading and trailing whitespace', async () => {
    const apiResponse = createResponse()
    elite2Api.globalSearch.mockReturnValue(apiResponse)

    await globalSearch({}, '  word  ')
    expect(elite2Api.globalSearch.mock.calls[0]).toEqual([{}, '', 'word', ''])
  })
})
