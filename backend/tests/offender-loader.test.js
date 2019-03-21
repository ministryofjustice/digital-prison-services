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

  it('should return offenders in the same order as the csv file', async () => {
    elite2Api.getBasicInmateDetailsForOffenders.mockReturnValue([
      { bookingId: 2, offenderNo: 'A222222' },
      { bookingId: 1, offenderNo: 'A111111' },
    ])

    const response = await offenderLoaderFactory(elite2Api).loadFromCsvContent(context, [
      ['A111111'],
      ['A222222'],
      ['BAD_NUMBER'],
    ])

    expect(response.length).toBe(2)
    expect(response[0]).toEqual({ bookingId: 1, offenderNo: 'A111111' })
    expect(response[1]).toEqual({ bookingId: 2, offenderNo: 'A222222' })
  })

  it('should remove duplicates from the file', async () => {
    await offenderLoaderFactory(elite2Api).loadFromCsvContent(context, [['A111111'], ['A111111']])

    expect(elite2Api.getBasicInmateDetailsForOffenders).toHaveBeenCalledWith(context, ['A111111'])
  })

  it('should strip out offenders that are not in the current active caseload', async () => {
    elite2Api.getBasicInmateDetailsForOffenders.mockReturnValue([
      { bookingId: 2, offenderNo: 'A222222', agencyId: 'MDI' },
      { bookingId: 1, offenderNo: 'A111111', agencyId: 'HLI' },
    ])

    const response = await offenderLoaderFactory(elite2Api).loadFromCsvContent(
      context,
      [['A111111'], ['A222222'], ['BAD_NUMBER']],
      'MDI'
    )

    expect(response.length).toBe(1)
    expect(response[0]).toEqual({ bookingId: 2, offenderNo: 'A222222', agencyId: 'MDI' })
  })
})
