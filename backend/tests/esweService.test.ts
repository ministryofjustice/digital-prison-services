import EsweService from '../services/esweService'
import { app } from '../config'
import CuriousApi from '../api/curious/curiousApi'

jest.mock('../config', () => ({
  app: {
    get esweEnabled() {
      return false
    },
  },
}))

describe('Education skills and work experience', () => {
  const curiousApi = {} as CuriousApi

  let service
  let getLearnerProfilesMock
  beforeEach(() => {
    getLearnerProfilesMock = jest.fn()
    curiousApi.getLearnerProfiles = getLearnerProfilesMock
    service = EsweService.create(curiousApi)
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
      getLearnerProfilesMock.mockResolvedValue([fakeLearnerProfile])

      const actual = await service.getLearnerProfiles(nomisId)
      expect(actual.enabled).toBeFalsy()
      expect(actual.content).toHaveLength(0)
      expect(getLearnerProfilesMock).not.toHaveBeenCalled()
    })

    it('should set enabled to true', async () => {
      jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)

      getLearnerProfilesMock.mockResolvedValue([fakeLearnerProfile])

      const actual = await service.getLearnerProfiles(nomisId)

      expect(actual.enabled).toBeTruthy()
      expect(actual.content).toHaveLength(1)
      expect(actual.content).toContain(fakeLearnerProfile)
      expect(getLearnerProfilesMock).toHaveBeenCalledTimes(1)
      expect(getLearnerProfilesMock).toHaveBeenCalledWith(nomisId)
    })
  })
})
