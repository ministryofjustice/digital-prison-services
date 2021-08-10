import prisonerWorkAndSkills from '../controllers/prisonerProfile/prisonerWorkAndSkills'
import { app } from '../config'

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
    english: [{ label: 'English/Welsh', value: 'Awaiting assessment' }],
  }

  const learningHistory = {
    total: '7',
    inProgress: '1',
    achieved: '2',
    failed: '1',
    withdrawn: '3',
  }

  const prisonerProfileService = {}
  const esweService = {}

  let req
  let res
  let controller

  beforeEach(() => {
    req = { params: { offenderNo }, session: { userDetails: { username: 'ITAG_USER' } } }
    res = { locals: {}, render: jest.fn(), redirect: jest.fn() }
    req.originalUrl = '/sentence-and-release'
    req.get = jest.fn()
    req.get.mockReturnValue('localhost')
    res.status = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)
    // @ts-expect-error ts-migrate(2339) FIXME
    esweService.getLearnerLatestAssessments = jest.fn().mockResolvedValue(functionalSkillLevels)
    // @ts-expect-error ts-migrate(2339) FIXME
    esweService.getLearnerEducation = jest.fn().mockResolvedValue(learningHistory)
    controller = prisonerWorkAndSkills({
      prisonerProfileService,
      esweService,
    })
  })
  it('should redirect to prisoner profile if esweEnabled is false', async () => {
    jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(false)
    await controller(req, res)
    expect(res.render).toHaveBeenCalledTimes(0)
  })
  it('should make expected calls and render the right template', async () => {
    jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
    await controller(req, res)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerWorkAndSkills/prisonerWorkAndSkills.njk',
      expect.objectContaining({
        prisonerProfileData,
        functionalSkillLevels,
        learningHistory,
      })
    )
  })
})
