import factory from '../controllers/reference-codes-service'

const context = {}
const prisonApi = {}
const service = factory(prisonApi)

const getAlertAPIData = [
  {
    domain: 'ALERT',
    code: 'A',
    description: 'Social Care',
    activeFlag: 'Y',
    listSeq: 12,
    systemDataFlag: 'N',
    subCodes: [
      {
        domain: 'ALERT_CODE',
        code: 'AS',
        description: 'Social Care',
        parentDomain: 'ALERT',
        parentCode: 'A',
        activeFlag: 'Y',
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
    activeFlag: 'Y',
    listSeq: 3,
    systemDataFlag: 'N',
    subCodes: [
      {
        domain: 'ALERT_CODE',
        code: 'C1',
        description: 'L1 Restriction No contact with any child',
        parentDomain: 'ALERT',
        parentCode: 'C',
        activeFlag: 'N',
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertTypes' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.getAlertTypes = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertTypes' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.getAlertTypes.mockReturnValue(getAlertAPIData)
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
