import { offenderLoaderFactory } from '../controllers/offender-loader'

describe('offender loader', () => {
  const elite2Api = {}
  const context = {}

  beforeEach(() => {
    elite2Api.getBasicInmateDetailsForOffenders = jest.fn()
  })

  it('should make a request for offenders', async () => {
    await offenderLoaderFactory(elite2Api).loadFromCsvContent(context, [['A111111'], ['A222222']])

    expect(elite2Api.getBasicInmateDetailsForOffenders).toHaveBeenCalledWith(context, ['A111111', 'A222222'])
  })
})
