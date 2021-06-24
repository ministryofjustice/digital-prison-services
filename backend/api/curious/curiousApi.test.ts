import CuriousApi, { dummyLearnerProfiles } from './curiousApi'

const curiousApi = CuriousApi.create()

describe('curiousApi', () => {
  describe('getLearnerProfiles', () => {
    it('should return the expected response data', async () => {
      const actual = await curiousApi.getLearnerProfiles('abc')
      expect(actual).toEqual(dummyLearnerProfiles)
    })
  })
})
