import factory from '../controllers/reference-codes-service'

const context = {}
const prisonerAlertsApi = {
  getAlertTypes: jest.fn(),
}
const service = factory(prisonerAlertsApi)

const getAlertAPIData = [
  {
    domain: 'ALERT',
    code: 'A',
    description: 'Social Care',
    isActive: true,
    listSeq: 12,
    systemDataFlag: 'N',
    alertCodes: [
      {
        domain: 'ALERT_CODE',
        code: 'AS',
        description: 'Social Care',
        parentDomain: 'ALERT',
        alertTypeCode: 'A',
        isActive: true,
        listSeq: 1,
        systemDataFlag: 'N',
        subCodes: [],
      },
    ],
  },
  {
    domain: 'ALERT',
    code: 'C',
    description: 'Child Communication Measures',
    isActive: true,
    listSeq: 3,
    systemDataFlag: 'N',
    alertCodes: [
      {
        domain: 'ALERT_CODE',
        code: 'C1',
        description: 'L1 Restriction No contact with any child',
        parentDomain: 'ALERT',
        alertTypeCode: 'C',
        isActive: false,
        listSeq: 3,
        systemDataFlag: 'N',
        expiredDate: '2015-10-27',
        subCodes: [],
      },
    ],
  },
]

describe('Reference codes service', () => {
  beforeEach(() => {
    prisonerAlertsApi.getAlertTypes = jest.fn()
    prisonerAlertsApi.getAlertTypes.mockReturnValue(getAlertAPIData)
  })
  it('should map to alert type sub type model', async () => {
    const model = await service.getAlertTypes(context)

    expect(model).toEqual({
      alertSubTypes: [
        { activeFlag: 'N', description: 'L1 Restriction No contact with any child', parentValue: 'C', value: 'C1' },
        { activeFlag: 'Y', description: 'Social Care', parentValue: 'A', value: 'AS' },
      ],
      alertTypes: [
        { activeFlag: 'Y', description: 'Child Communication Measures', value: 'C' },
        { activeFlag: 'Y', description: 'Social Care', value: 'A' },
      ],
    })
  })
})
