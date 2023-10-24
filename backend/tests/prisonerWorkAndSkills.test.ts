import prisonerWorkAndSkills from '../controllers/prisonerProfile/prisonerWorkAndSkills'
import Mock = jest.Mock

jest.mock('../config', () => ({
  app: {
    get esweEnabled() {
      return false
    },
  },
}))

describe('Prisoner work and skills controller', () => {
  const offenderNo = 'G3878UK'
  const prisonerProfileData = {
    activeAlertCount: 1,
    agencyName: 'Moorland Closed',
    alerts: [],
    category: 'Cat C',
    csra: 'High',
    inactiveAlertCount: 2,
    incentiveLevel: 'Standard',
    keyWorkerLastSession: '07/04/2020',
    keyWorkerName: 'Member, Staff',
    location: 'CELL-123',
    offenderName: 'Prisoner, Test',
    offenderNo,
  }
  const functionalSkillLevels = {
    digiLit: [
      { label: 'Digital Literacy', value: 'Entry Level 1' },
      { label: 'Assessment date', value: '1 July 2021' },
      { label: 'Assessment location', value: 'HMP Moorland' },
    ],
    maths: [
      { label: 'Maths', value: 'Entry Level 1' },
      { label: 'Assessment date', value: '1 July 2021' },
      { label: 'Assessment location', value: 'HMP Moorland' },
    ],
    english: [{ label: 'English', value: 'Awaiting assessment' }],
  }

  const targets = {
    employmentGoals: ['To be a plumber'],
    personalGoals: ['To be able to support my family'],
  }

  const coursesAndQualifications = {
    historicalCoursesPresent: false,
    currentCourseData: [{ label: 'Ocean Science', value: `Planned end date on 30 September 2023` }],
  }

  const currentWork = {
    workHistoryPresent: false,
    currentJobs: [{ label: 'Cleaner HB1 AM', value: 'Started on 19 August 2021' }],
  }

  const prisonerProfileService: {
    getPrisonerProfileData?: Mock
  } = {}
  const esweService: {
    getLearnerLatestAssessments?: Mock
    getLearnerGoals?: Mock
    getLearnerEducation?: Mock
    getLearnerEmployabilitySkills?: Mock
    getCurrentActivities?: Mock
  } = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = { params: { offenderNo }, session: { userDetails: { username: 'ITAG_USER' } } }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
    req.originalUrl = '/work-and-skills'
    req.get = jest.fn()
    req.get.mockReturnValue('localhost')
    res.status = jest.fn()
    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)
    esweService.getLearnerLatestAssessments = jest.fn().mockResolvedValue(functionalSkillLevels)
    esweService.getLearnerGoals = jest.fn().mockResolvedValue(targets)
    esweService.getLearnerEducation = jest.fn().mockResolvedValue(coursesAndQualifications)
    esweService.getCurrentActivities = jest.fn().mockResolvedValue(currentWork)
    esweService.getLearnerEmployabilitySkills = jest.fn().mockResolvedValue([])
    controller = prisonerWorkAndSkills({
      prisonerProfileService,
      esweService,
    })
  })

  it('should make expected calls and render the right template', async () => {
    await controller(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerWorkAndSkills/prisonerWorkAndSkills.njk',
      expect.objectContaining({
        prisonerProfileData,
        functionalSkillLevels,
        targets,
        coursesAndQualifications,
        currentWork,
      })
    )
  })
})
