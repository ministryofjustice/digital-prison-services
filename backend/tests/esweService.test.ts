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
  let getLearnerLatestAssessmentsMock
  beforeEach(() => {
    getLearnerProfilesMock = jest.fn()
    curiousApi.getLearnerProfiles = getLearnerProfilesMock
    getLearnerLatestAssessmentsMock = jest.fn()
    curiousApi.getLearnerLatestAssessments = getLearnerLatestAssessmentsMock

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

  describe('Work and skills tab', () => {
    describe('functional skills assessment', () => {
      const nomisId = 'G2823GV'

      it('should return expected assessments when there is one of each subject available', async () => {
        const dummyFunctionalSkillsLevels = {
          prn: 'G8346GA',
          qualifications: [
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'English',
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-05-02',
              },
            },
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'Digital Literacy',
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-06-01',
              },
            },
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'Maths',
                qualificationGrade: 'Entry Level 1',
                assessmentDate: '2021-05-27',
              },
            },
          ],
        }

        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerLatestAssessmentsMock.mockResolvedValue([dummyFunctionalSkillsLevels])
        const expectedResult = {
          digiLit: [
            { label: 'Digital Literacy', value: 'Entry Level 2' },
            { label: 'Assessment date', value: '1 June 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
          english: [
            { label: 'English/Welsh', value: 'Entry Level 2' },
            { label: 'Assessment date', value: '2 May 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
          maths: [
            { label: 'Maths', value: 'Entry Level 1' },
            { label: 'Assessment date', value: '27 May 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
        }

        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toStrictEqual(expectedResult)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledTimes(1)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledWith(nomisId)
      })
      it('should return expected assessments when there are multiple assessments for a subject available', async () => {
        const dummyFunctionalSkillsLevels = {
          prn: 'G8346GA',
          qualifications: [
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'English',
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-03-02',
              },
            },
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'English',
                qualificationGrade: 'Entry Level 3',
                assessmentDate: '2021-06-30',
              },
            },
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'Digital Literacy',
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-06-01',
              },
            },
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'Maths',
                qualificationGrade: 'Entry Level 1',
                assessmentDate: '2021-05-27',
              },
            },
          ],
        }

        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerLatestAssessmentsMock.mockResolvedValue([dummyFunctionalSkillsLevels])

        const expectedResult = {
          digiLit: [
            { label: 'Digital Literacy', value: 'Entry Level 2' },
            { label: 'Assessment date', value: '1 June 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
          english: [
            { label: 'English/Welsh', value: 'Entry Level 3' },
            { label: 'Assessment date', value: '30 June 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
          maths: [
            { label: 'Maths', value: 'Entry Level 1' },
            { label: 'Assessment date', value: '27 May 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
        }

        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toStrictEqual(expectedResult)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledTimes(1)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledWith(nomisId)
      })
      it('should return expected response when there are no assessments available for a subject', async () => {
        const dummyFunctionalSkillsLevels = {
          prn: 'G8346GA',
          qualifications: [
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'English',
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-05-02',
              },
            },
            {
              establishmentId: 2,
              establishmentName: 'HMP Winchester',
              qualification: {
                qualificationType: 'Digital Literacy',
                qualificationGrade: 'Entry Level 2',
                assessmentDate: '2021-06-01',
              },
            },
          ],
        }

        jest.spyOn(app, 'esweEnabled', 'get').mockReturnValue(true)
        getLearnerLatestAssessmentsMock.mockResolvedValue([dummyFunctionalSkillsLevels])
        const expectedResult = {
          digiLit: [
            { label: 'Digital Literacy', value: 'Entry Level 2' },
            { label: 'Assessment date', value: '1 June 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
          english: [
            { label: 'English/Welsh', value: 'Entry Level 2' },
            { label: 'Assessment date', value: '2 May 2021' },
            { label: 'Assessment location', value: 'HMP Winchester' },
          ],
          maths: [{ label: 'Maths', value: 'Awaiting assessment' }],
        }

        const actual = await service.getLearnerLatestAssessments(nomisId)
        expect(actual.enabled).toBeTruthy()
        expect(actual.content).toStrictEqual(expectedResult)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledTimes(1)
        expect(getLearnerLatestAssessmentsMock).toHaveBeenCalledWith(nomisId)
      })
    })
  })
})
