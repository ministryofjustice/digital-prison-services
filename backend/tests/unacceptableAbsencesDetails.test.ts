import unacceptableAbsencesDetails from '../controllers/prisonerProfile/unacceptableAbsencesDetails'

jest.mock('../config', () => ({
  app: {
    get esweEnabled() {
      return false
    },
  },
}))

const PAGINATION_IN = { totalRecords: 4, offset: 1, limit: 3 }
const PAGINATION_OUT = { page: 1, size: 2 }

describe('Unacceptable absences details controller', () => {
  const offenderNo = 'G3878UK'
  const prisonApi = {
    getDetails: jest.fn(),
    getAgencies: jest.fn(),
  }
  const esweService = {
    getAttendanceDetails: jest.fn(),
  }
  const paginationService = {
    getPagination: jest.fn(),
  }
  const error = new Error('Network error')
  const list = [
    {
      attribute1: 'value1',
      attribute2: 'value2',
    },
    {
      attribute1: 'value3',
      attribute2: 'value4',
    },
  ]

  let req
  let res
  let controller

  beforeEach(() => {
    req = { params: { offenderNo }, session: { userDetails: { username: 'ITAG_USER' } } }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
    req.originalUrl = '/courses-qualifications'
    req.get = jest.fn()
    req.get.mockReturnValue('localhost')
    req.query = { pageOffsetOption: 3 }
    res.status = jest.fn()

    esweService.getAttendanceDetails = jest.fn().mockResolvedValue({
      enabled: true,
      content: { fullDetails: list, pagination: PAGINATION_IN },
    })
    prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'Apoustius', lastName: 'Ignian' })
    prisonApi.getAgencies = jest.fn().mockResolvedValue([])
    paginationService.getPagination = jest.fn().mockReturnValue(PAGINATION_OUT)

    controller = unacceptableAbsencesDetails({
      paginationService,
      prisonApi,
      esweService,
    })
  })

  it('should make expected calls and render the right template', async () => {
    const prisonerName = 'Apoustius Ignian'
    const breadcrumbPrisonerName = 'Ignian, Apoustius'
    const profileUrl = `/prisoner/G3878UK/work-and-skills#work-summary`
    await controller(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerWorkAndSkills/unacceptableAbsencesDetails.njk',
      expect.objectContaining({
        breadcrumbPrisonerName,
        prisonerName,
        profileUrl,
        fullDetails: list,
        pagination: PAGINATION_OUT,
        prisons: new Map(),
      })
    )
  })

  it('should redirect to prisoner profile and throw error when prisonAPI fails', async () => {
    prisonApi.getDetails.mockImplementation(() => Promise.reject(error))
    await expect(controller(req, res)).rejects.toThrowError(error)
    expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
  })

  it('should redirect to prisoner profile and throw error when curious API fails', async () => {
    esweService.getAttendanceDetails.mockImplementation(() => Promise.reject(error))
    await expect(controller(req, res)).rejects.toThrowError(error)
    expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
  })
})
