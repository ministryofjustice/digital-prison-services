import learnerEmployabilitySkillsDetails from '../controllers/prisonerProfile/learnerEmployabilitySkillsDetails'

jest.mock('../config', () => ({
  app: {
    get esweEnabled() {
      return false
    },
  },
}))

const PAGINATION_IN = { totalRecords: 4, offset: 1, limit: 3 }
const PAGINATION_OUT = { page: 1, size: 2 }

describe('learnerEmployabilitySkillsDetails controller', () => {
  const offenderNo = 'G3878UK'
  const prisonApi = {
    getDetails: jest.fn(),
  }
  const esweService = {
    getLearnerEmployabilitySkillsDetails: jest.fn(),
  }
  const paginationService = {
    getPagination: jest.fn(),
  }
  const error = new Error('Network error')
  const oldReview = { reviewDate: '2021-01-25' }
  const newReview = { reviewDate: '2021-01-26' }
  const map = new Map().set('Initiative', [oldReview, newReview]).set('Communication', [])

  const learnerEmployabilitySkills = {
    enabled: true,
    content: map,
  }
  const prisonerDetails = { firstName: 'Apoustius', lastName: 'Ignian' }

  let req
  let res
  let controller

  beforeEach(() => {
    req = {
      params: { offenderNo },
      query: { skill: 'Initiative', pageOffsetOption: 0 },
      session: { userDetails: { username: 'ITAG_USER' } },
      get: jest.fn(),
      originalUrl: '/skills',
    }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn(), status: jest.fn() }
    req.get.mockReturnValue('localhost')

    esweService.getLearnerEmployabilitySkillsDetails = jest.fn().mockResolvedValue(learnerEmployabilitySkills)

    prisonApi.getDetails = jest.fn().mockResolvedValue(prisonerDetails)
    paginationService.getPagination = jest.fn().mockReturnValue(PAGINATION_OUT)

    controller = learnerEmployabilitySkillsDetails({
      paginationService,
      prisonApi,
      esweService,
    })
  })

  it('should make expected calls and render the right template', async () => {
    const prisonerName = 'Apoustius Ignian'
    const breadcrumbPrisonerName = 'Ignian, Apoustius'
    const profileUrl = `/prisoner/G3878UK/work-and-skills#employability-skills-summary`
    const currentReviewPage = []

    await controller(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerWorkAndSkills/learnerEmployabilitySkills.njk',
      expect.objectContaining({
        breadcrumbPrisonerName,
        prisonerName,
        profileUrl,
        prisonerDetails,
        learnerEmployabilitySkills,
        currentReviewPage: [newReview, oldReview], // sort descending
        skill: 'Initiative',
        pagination: PAGINATION_OUT,
      })
    )
  })

  it('should redirect to prisoner profile and throw error when curious API fails', async () => {
    esweService.getLearnerEmployabilitySkillsDetails.mockImplementation(() => Promise.reject(error))
    await expect(controller(req, res)).rejects.toThrowError(error)
    expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
  })

  it('should catch invalid parameter and throw error', async () => {
    req.query.skill = "';DROP TABLE"
    await expect(controller(req, res)).rejects.toThrowError('invalid skill query parameter')
  })
})
