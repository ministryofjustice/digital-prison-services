import prisonerCoursesQualificationsDetails from '../controllers/prisonerProfile/prisonerCoursesQualificationsDetails'
import { app } from '../config'

jest.mock('../config', () => ({
  app: {
    get esweEnabled() {
      return false
    },
  },
}))

const PAGINATION_IN = { totalRecords: 4, offset: 1, limit: 3 }
const PAGINATION_OUT = { page: 1, size: 2 }

describe('Prisoner courses and qualifications details controller', () => {
  const offenderNo = 'G3878UK'
  const prisonApi = {
    getDetails: jest.fn(),
  }
  const esweService = {
    getLearnerEducationFullDetails: jest.fn(),
  }
  const paginationService = {
    getPagination: jest.fn(),
  }

  const coursesAndQualifications = [
    {
      courseName: 'Foundation Degree in Arts in Equestrian Practice and Technology',
      dateFrom: '2021-07-19',
      dateTo: '2021-07-21',
      location: 'HMP Moorland',
      outcome: 'Fail',
      outcomeDetails: 'No achievement',
      type: 'Accredited',
    },
    {
      courseName: 'Certificate of Management',
      dateFrom: '2021-07-01',
      dateTo: '2021-07-08',
      location: 'HMP Moorland',
      outcome: 'Withdrawn',
      outcomeDetails: 'Changes in their risk profile meaning they can no longer take part in the learning',
      type: 'Accredited',
    },
    {
      courseName: 'Human Science',
      dateFrom: '2020-09-01',
      dateTo: '2020-12-02',
      location: 'HMP Moorland',
      outcome: 'Pass',
      outcomeDetails: 'Achieved',
      type: 'Non-accredited',
    },
    {
      courseName: 'Ocean Science',
      dateFrom: '2019-12-15',
      dateTo: '2020-03-31',
      location: 'HMP Bristol',
      outcome: 'In progress',
      outcomeDetails: '',
      type: 'Non-accredited',
    },
    {
      courseName: 'Foundation Degree in Cricket Coaching - (Myerscough College)',
      dateFrom: '2019-10-01',
      dateTo: '2019-10-02',
      location: 'HMP Dartmoor',
      outcome: 'Withdrawn',
      outcomeDetails: 'Changes in their risk profile meaning they can no longer take part in the learning',
      type: 'Accredited',
    },
    {
      courseName: 'Instructing group cycling sessions',
      dateFrom: '2019-08-01',
      dateTo: '2019-08-01',
      location: 'HMP Leyhill',
      outcome: 'In progress',
      outcomeDetails: '',
      type: 'Accredited',
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

    esweService.getLearnerEducationFullDetails = jest.fn().mockResolvedValue({
      enabled: true,
      content: { fullDetails: coursesAndQualifications, pagination: PAGINATION_IN },
    })
    prisonApi.getDetails = jest.fn().mockResolvedValue({ firstName: 'Apoustius', lastName: 'Ignian' })
    paginationService.getPagination = jest.fn().mockReturnValue(PAGINATION_OUT)

    controller = prisonerCoursesQualificationsDetails({
      paginationService,
      prisonApi,
      esweService,
    })
  })
  it('should make expected calls and render the right template', async () => {
    const prisonerName = 'Apoustius Ignian'
    const breadcrumbPrisonerName = 'Ignian, Apoustius'
    const profileUrl = `/prisoner/G3878UK/work-and-skills#courses-summary`
    const pagination = {}
    await controller(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerWorkAndSkills/prisonerCoursesQualificationsDetails.njk',
      expect.objectContaining({
        breadcrumbPrisonerName,
        prisonerName,
        profileUrl,
        coursesAndQualifications: {
          content: { fullDetails: coursesAndQualifications, pagination: PAGINATION_IN },
          enabled: true,
        },
        pagination: PAGINATION_OUT,
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
      esweService.getLearnerEducationFullDetails.mockImplementation(() => Promise.reject(error))
      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
    })
  })
})
