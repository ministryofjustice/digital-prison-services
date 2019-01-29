import { offenderLoaderFactory } from '../controllers/offender-loader'

describe('offender loader', () => {
  const elite2Api = {}
  const context = {}

  beforeEach(() => {
    elite2Api.getBooking = jest.fn()
  })

  it('should make a request for offenders', async () => {
    const csvData = `
         offenderNo
         A111111
         A222222         
       `
    await offenderLoaderFactory(elite2Api).loadFromCsvContent(context, csvData)

    expect(elite2Api.getBooking).toHaveBeenCalledWith(context, 'A111111')
    expect(elite2Api.getBooking).toHaveBeenCalledWith(context, 'A222222')
  })

  it('should return offenders with start times', async () => {
    const offenders = [
      { offenderNo: 'A111111', firstName: 'firstName1', lastName: 'lastName1' },
      { offenderNo: 'A222222', firstName: 'firstName2', lastName: 'lastName2' },
    ]
    const csvData = `
        A111111, 14:00
        A222222,         
    `
    elite2Api.getBooking.mockImplementation((_context, offenderNo) =>
      offenders.find(offender => offender.offenderNo === offenderNo)
    )

    const response = await offenderLoaderFactory(elite2Api).loadFromCsvContent(context, csvData)

    expect(response).toEqual([{ ...offenders[0], startTime: '14:00' }, { ...offenders[1], startTime: '' }])
  })
})
