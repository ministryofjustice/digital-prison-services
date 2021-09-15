import prisonerWorkInsidePrisonDetails from '../controllers/prisonerProfile/prisonerWorkInsidePrisonDetails'
import { app } from '../config'

jest.mock('../config', () => ({
  app: {
    get esweEnabled() {
      return false
    },
  },
}))

describe('Prisoner work inside prison details controller', () => {
  const offenderNo = 'G3878UK'
  const prisonApi = {
    getDetails: jest.fn(),
  }
  const esweService = {
    getWorkHistoryDetails: jest.fn(),
  }

  const workHistoryInsidePrison = [
    { endDate: null, location: 'Moorland (HMP & YOI)', role: 'Cleaner HB1 AM', startDate: '2021-08-19' },
    { endDate: '2021-07-23', location: 'Moorland (HMP & YOI)', role: 'Cleaner HB1 AM', startDate: '2021-07-20' },
    { endDate: '2021-07-23', location: 'Moorland (HMP & YOI)', role: 'Cleaner HB1 PM', startDate: '2021-07-20' },
  ]

  let req
  let res
  let controller

  beforeEach(() => {
    req = { params: { offenderNo }, session: { userDetails: { username: 'ITAG_USER' } } }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
    req.originalUrl = '/work-inside-prison'
    req.get = jest.fn()
    req.get.mockReturnValue('localhost')
    res.status = jest.fn()

    esweService.getWorkHistoryDetails = jest.fn().mockResolvedValue(workHistoryInsidePrison)
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'Apoustius',
      lastName: 'Ignian',
    })

    controller = prisonerWorkInsidePrisonDetails({
      prisonApi,
      esweService,
    })
  })
  it('should redirect to prisoner profile if esweEnabled is false', async () => {
    jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(false)
    await controller(req, res)
    expect(res.render).toHaveBeenCalledTimes(0)
  })
  it('should make expected calls and render the right template', async () => {
    const prisonerName = 'Apoustius Ignian'
    const breadcrumbPrisonerName = 'Ignian, Apoustius'
    const profileUrl = `/prisoner/G3878UK/work-and-skills#work-summary`
    jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
    await controller(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerWorkAndSkills/prisonerWorkInsidePrisonDetails.njk',
      expect.objectContaining({
        breadcrumbPrisonerName,
        prisonerName,
        profileUrl,
        workHistoryInsidePrison,
      })
    )
  })
  describe('When there are API errors', () => {
    const error = new Error('Network error')

    it('should redirect to prisoner profile and throw error when prisonAPI fails', async () => {
      prisonApi.getDetails.mockImplementation(() => Promise.reject(error))
      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
    })
    it('should redirect to prisoner profile and throw error when curious API fails', async () => {
      esweService.getWorkHistoryDetails.mockImplementation(() => Promise.reject(error))
      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
    })
  })
})
