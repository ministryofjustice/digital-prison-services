const { app } = require('../config')
const EsweService = require('../services/esweService')

jest.mock('../config', () => ({
  app: {
    get esweEnabled() {
      return false
    },
  },
}))

describe('Education skills and work experience', () => {
  const prisonApi = jest.fn()
  const curiousApi = {}

  let service
  beforeEach(() => {
    curiousApi.getLearnerProfiles = jest.fn()
    service = EsweService.create(curiousApi, prisonApi)
  })

  describe('learner profiles', () => {
    const fakeLearnerProfile = {
      prn: 'G8346GA',
      establishmentId: 2,
      establishmentName: 'HMP Winchester',
      uln: '345455',
      lddHealthProblem: 'Autistic spectrum disorder',
      priorAttainment: '',
      qualifications: [
        {
          qualificationType: 'Maths',
          qualificationGrade: 'A',
          assessmentDate: '2021-06-22',
        },
      ],
      languageStatus: 'string',
      plannedHours: '8',
    }

    const nomisId = 'G2823GV'

    it('should return expected learner profiles', async () => {
      curiousApi.getLearnerProfiles.mockResolvedValue([fakeLearnerProfile])

      const actual = await service.getLearnerProfiles(nomisId)
      expect(actual.enabled).toBeFalsy()
      expect(actual.content).toHaveLength(0)
      expect(curiousApi.getLearnerProfiles).not.toHaveBeenCalled()
    })

    it('should set enabled to true', async () => {
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)

      curiousApi.getLearnerProfiles.mockResolvedValue([fakeLearnerProfile])

      const actual = await service.getLearnerProfiles(nomisId)

      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toHaveLength(1)
      expect(actual.content).toContain(fakeLearnerProfile)
      expect(curiousApi.getLearnerProfiles).toHaveBeenCalledTimes(1)
      expect(curiousApi.getLearnerProfiles).toHaveBeenCalledWith(nomisId)
    })
  })
})
