import CuriousApi, { dummyLearnerProfiles, dummyLearnerLatestAssessments } from './curiousApi'

const curiousApi = CuriousApi.create()

describe('curiousApi', () => {
  describe('getLearnerProfiles', () => {
    it('should return the expected response data', async () => {
      const actual = await curiousApi.getLearnerProfiles('abc')
      expect(actual).toEqual(dummyLearnerProfiles)
    })
  })
  describe('getLearnerLatestAssessments', () => {
    it('should return the expected response data', async () => {
      const actual = await curiousApi.getLearnerLatestAssessments('abc')
      expect(actual).toEqual(dummyLearnerLatestAssessments)
    })
  })
})
