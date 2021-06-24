/**
 * TODO: remove this during the curious api integration
 */
const dummyLearnerProfiles = [
  {
    prn: 'G8346GA',
    establishmentId: 2,
    establishmentName: 'HMP Winchester',
    uln: '345455',
    lddHealthProblem: 'Dyslexia',
    priorAttainment: '',
    qualifications: [
      {
        qualificationType: 'English',
        qualificationGrade: 'c',
        assessmentDate: '2021-06-22',
      },
    ],
    languageStatus: 'string',
    plannedHours: '8',
  },
  {
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
  },
]

const curiousApiFactory = (_) => ({
  getLearnerProfiles() {
    return Promise.resolve(dummyLearnerProfiles)
  },
})

module.exports = { curiousApiFactory, dummyLearnerProfiles }
