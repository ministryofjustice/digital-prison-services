const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { clickIfExist } = require('../../test-helpers')

context('Prisoner Work and Skills', () => {
  const offenderNo = 'G6123VU'

  const visitWorkAndSkillsAndExpandAccordions = () => {
    cy.visit(`/prisoner/${offenderNo}/work-and-skills`)
    clickIfExist('.govuk-accordion__open-all[aria-expanded="false"]')
  }

  const prisonerProfileHeaderData = {
    offenderBasicDetails,
    offenderFullDetails,
    iepSummary: {},
    caseNoteSummary: {},
    offenderNo,
  }

  context('When there is no data because of an api call failure', () => {
    const apiErrorText = 'We cannot show these details right now. Try reloading the page.'

    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()

      cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)

      cy.task('stubWorkAndSkillsApi500Errors')
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    context('functional skills section', () => {
      it('should show correct error message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="learner-latest-assessments-errorMessage"]').should('have.text', apiErrorText)
      })
    })
    context('goals section', () => {
      it('should show correct error message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="goals-errorMessage"]').should('have.text', apiErrorText)
      })
    })
    context('courses and qualifications section', () => {
      it('should show correct error message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="courses-errorMessage"]').should('have.text', apiErrorText)
      })
    })
    // context('work inside prison section', () => {
    //   it('should show correct error message', () => {
    //     visitWorkAndSkillsAndExpandAccordions()
    //     cy.get('[data-test="work-errorMessage"]').should('have.text', apiErrorText)
    //   })
    // })
  })

  context('When the prisoner is not in Curious', () => {
    const error = {
      errorCode: 'VC404',
      errorMessage: 'Resource not found',
      httpStatusCode: 404,
    }

    before(() => {
      cy.task('reset')
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()

      cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)

      cy.task('stubWorkAndSkillsApi404Errors', error)
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    context('functional skills section', () => {
      it('should show "awaiting assessments" content for each skill', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 3)
            })
        })
      })
    })
    context('goals section', () => {
      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="goals-noGoals"]').then(($message) => {
          cy.get($message).then(($goalsMessage) => {
            cy.get($goalsMessage).should('have.text', 'John Smith has not set any goals.')
          })
        })
      })
    })
    context('courses and qualifications section', () => {
      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="courses-noData"]').then(($message) => {
          cy.get($message).then(($noCoursesMessage) => {
            cy.get($noCoursesMessage).should('have.text', 'John Smith has no courses or qualifications.')
          })
        })
      })
    })
    // context('work inside prison section', () => {
    //   it('should show default message', () => {
    //     visitWorkAndSkillsAndExpandAccordions()
    //     cy.get('[data-test="work-noData"]').then(($message) => {
    //       cy.get($message).then(($noCoursesMessage) => {
    //         cy.get($noCoursesMessage).should('have.text', 'John Smith has no current or previous work inside prison.')
    //       })
    //     })
    //   })
    // })
  })

  context('When the user is in Curious but there is no data', () => {
    const functionalSkillsAssessments = [
      {
        prn: 'G1670VU',
        qualifications: [],
      },
    ]
    const emptyGoals = {
      prn: 'G9981UK',
      employmentGoals: [],
      personalGoals: [],
      longTermGoals: [],
      shortTermGoals: [],
    }

    const emptyCourses = {
      content: [],
      number: 0,
      size: 10,
      totalElements: 0,
      first: true,
      last: true,
      hasContent: false,
      numberOfElements: 0,
      totalPages: 0,
      pageable: {},
      empty: true,
    }

    // const emptyWork = {
    //   offenderNo: 'G9981UK',
    //   workActivities: [],
    // }

    before(() => {
      cy.task('reset')
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()

      cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)

      cy.task('stubLatestLearnerAssessments', functionalSkillsAssessments)
      cy.task('stubLearnerGoals', emptyGoals)
      cy.task('stubLearnerEducation', emptyCourses)
      // cy.task('stubOffenderCurrentWork', emptyWork)
      // cy.task('stubOffenderWorkHistory', emptyWork)
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    context('functional skills section', () => {
      it('should show three subjects in the correct format and awaiting assessments content', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 3)
              expect($summaryLabels.get(0).innerText).to.contain('English')
              expect($summaryLabels.get(1).innerText).to.contain('Maths')
              expect($summaryLabels.get(2).innerText).to.contain('Digital Literacy')
            })
        })
      })
    })
    context('goals section', () => {
      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="goals-noGoals"]').then(($message) => {
          cy.get($message).then(($goalsMessage) => {
            cy.get($goalsMessage).should('have.text', 'John Smith has not set any goals.')
          })
        })
      })
    })
    context('courses and qualification section', () => {
      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="courses-noData"]').then(($message) => {
          cy.get($message).then(($noCoursesMessage) => {
            cy.get($noCoursesMessage).should('have.text', 'John Smith has no courses or qualifications.')
          })
        })
      })
    })
    // context('work inside prison section', () => {
    //   it('should show default message', () => {
    //     visitWorkAndSkillsAndExpandAccordions()
    //     cy.get('[data-test="work-noData"]').then(($message) => {
    //       cy.get($message).then(($noCoursesMessage) => {
    //         cy.get($noCoursesMessage).should('have.text', 'John Smith has no current or previous work inside prison.')
    //       })
    //     })
    //   })
    // })
  })

  context('When the user is in Curious and there is data available', () => {
    // const dummyCurrentWork = {
    //   offenderNo,
    //   workActivities: [
    //     {
    //       bookingId: 1102484,
    //       agencyLocationId: 'MDI',
    //       agencyLocationDescription: 'Moorland (HMP & YOI)',
    //       description: 'Cleaner HB1 AM',
    //       startDate: '2021-08-19',
    //     },
    //   ],
    // }

    // const dummyWorkHistory = {
    //   offenderNo,
    //   workActivities: [
    //     {
    //       bookingId: 1102484,
    //       agencyLocationId: 'MDI',
    //       agencyLocationDescription: 'Moorland (HMP & YOI)',
    //       description: 'Cleaner HB1 AM',
    //       startDate: '2021-08-19',
    //     },
    //     {
    //       bookingId: 1102484,
    //       agencyLocationId: 'MDI',
    //       agencyLocationDescription: 'Moorland (HMP & YOI)',
    //       description: 'Cleaner HB1 AM',
    //       startDate: '2021-07-20',
    //       endDate: '2021-07-23',
    //     },
    //     {
    //       bookingId: 1102484,
    //       agencyLocationId: 'MDI',
    //       agencyLocationDescription: 'Moorland (HMP & YOI)',
    //       description: 'Cleaner HB1 PM',
    //       startDate: '2021-07-20',
    //       endDate: '2021-07-23',
    //     },
    //   ],
    // }

    const functionalSkillsAssessments = [
      {
        prn: 'G6123VU',
        qualifications: [
          {
            establishmentId: 8,
            establishmentName: 'HMP Moorland',
            qualification: {
              qualificationType: 'English',
              qualificationGrade: 'Level 1',
              assessmentDate: '2021-05-13',
            },
          },
          {
            establishmentId: 8,
            establishmentName: 'HMP Moorland',
            qualification: {
              qualificationType: 'Maths',
              qualificationGrade: 'Level 1',
              assessmentDate: '2021-05-20',
            },
          },
          {
            establishmentId: 8,
            establishmentName: 'HMP Moorland',
            qualification: {
              qualificationType: 'Digital Literacy',
              qualificationGrade: 'Level 2',
              assessmentDate: '2021-05-19',
            },
          },
        ],
      },
    ]
    const dummyGoals = {
      prn: 'G8346GA',
      employmentGoals: ['To be a plumber', 'To get a plumbing qualification'],
      personalGoals: [
        'To be able to support my family',
        'To get a 100% attendance record on my classes',
        'To make my mum proud',
      ],
      longTermGoals: ['To buy a house'],
      shortTermGoals: ['To get out of my overdraft'],
    }

    const dummyEducation = {
      content: [
        {
          prn: 'G6123VU',
          courseName: 'Pink',
          learningPlannedEndDate: '2022-02-27',
          completionStatus:
            'The learner is continuing or intending to continue the learning activities leading to the learning aim',
        },
        {
          prn: 'G6123VU',
          courseName: 'Running',
          learningPlannedEndDate: '2022-01-01',
          completionStatus:
            'The learner is continuing or intending to continue the learning activities leading to the learning aim',
        },
        {
          prn: 'G6123VU',
          courseName: 'Cycling',
          learningPlannedEndDate: '2022-04-30',
          completionStatus: 'The learner has withdrawn from the learning activities leading to the learning aim',
        },
      ],
    }

    before(() => {
      cy.task('reset')
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.login()

      cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)

      cy.task('stubLatestLearnerAssessments', functionalSkillsAssessments)
      cy.task('stubLearnerGoals', dummyGoals)
      cy.task('stubLearnerEducation', dummyEducation)
      // cy.task('stubOffenderCurrentWork', dummyCurrentWork)
      // cy.task('stubOffenderWorkHistory', dummyWorkHistory)
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    context('functional skills section', () => {
      it('should have the correct labels and values', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 9)
              expect($summaryLabels.get(0).innerText).to.contain('English')
              expect($summaryLabels.get(1).innerText).to.contain('Assessment date')
              expect($summaryLabels.get(2).innerText).to.contain('Assessment location')
              expect($summaryLabels.get(3).innerText).to.contain('Maths')
              expect($summaryLabels.get(4).innerText).to.contain('Assessment date')
              expect($summaryLabels.get(5).innerText).to.contain('Assessment location')
              expect($summaryLabels.get(6).innerText).to.contain('Digital Literacy')
              expect($summaryLabels.get(7).innerText).to.contain('Assessment date')
              expect($summaryLabels.get(8).innerText).to.contain('Assessment location')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 9)
              expect($summaryValues.get(0).innerText).to.contain('Level 1')
              expect($summaryValues.get(1).innerText).to.contain('13 May 2021')
              expect($summaryValues.get(2).innerText).to.contain('HMP Moorland')
              expect($summaryValues.get(3).innerText).to.contain('Level 1')
              expect($summaryValues.get(4).innerText).to.contain('20 May 2021')
              expect($summaryValues.get(5).innerText).to.contain('HMP Moorland')
              expect($summaryValues.get(6).innerText).to.contain('Level 2')
              expect($summaryValues.get(7).innerText).to.contain('19 May 2021')
              expect($summaryValues.get(8).innerText).to.contain('HMP Moorland')
            })
        })
      })
    })
    context('goals section', () => {
      it('should show the list of employment goals', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="employment-goals"]').then(($ul) => {
          cy.get($ul)
            .find('li')
            .then(($listElement) => {
              cy.get($listElement).its('length').should('eq', 2)
              expect($listElement.get(0)).to.contain('To be a plumber')
              expect($listElement.get(1)).to.contain('To get a plumbing qualification')
            })
        })
      })
      it('should show the list of personal goals', () => {
        visitWorkAndSkillsAndExpandAccordions()

        cy.get('[data-test="personal-goals"]').then(($ul) => {
          cy.get($ul)
            .find('li')
            .then(($listElement) => {
              cy.get($listElement).its('length').should('eq', 3)
              expect($listElement.get(0)).to.contain('To be able to support my family')
              expect($listElement.get(1)).to.contain('To get a 100% attendance record on my classes')
              expect($listElement.get(2)).to.contain('To make my mum proud')
            })
        })
      })
    })
    context('courses and qualifications section', () => {
      it('should display the correct courses as labels, ordered by date', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="courses-currentCourses"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 2)
              expect($summaryLabels.get(0).innerText).to.contain('Running')
              expect($summaryLabels.get(1).innerText).to.contain('Pink')
            })
        })
      })
      it('should display the correct planned end dates as values, ordered by date', () => {
        visitWorkAndSkillsAndExpandAccordions()

        cy.get('[data-test="courses-currentCourses"]').then(($summary) => {
          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 2)
              expect($summaryValues.get(0).innerText).to.contain('Planned end date on 1 January 2022')
              expect($summaryValues.get(1).innerText).to.contain('Planned end date on 27 February 2022')
            })
        })
      })
      it('should display the link to the details page if there are historical courses', () => {
        visitWorkAndSkillsAndExpandAccordions()

        cy.get('[data-test="courses-detailsLink"]').then(($link) => {
          cy.get($link).should('have.text', 'View courses and qualifications details')
        })
      })
    })
    // context('work in prison section', () => {
    // it('should display the list of current jobs and their start dates', () => {
    // visitWorkAndSkillsAndExpandAccordions()
    // cy.get('[data-test="work-summary"]').then(($summary) => {
    //   cy.get($summary)
    //     .find('dt')
    //     .then(($summaryLabels) => {
    //       cy.get($summaryLabels).its('length').should('eq', 1)
    //       expect($summaryLabels.get(0).innerText).to.contain('Cleaner HB1 AM')
    //     })

    //   cy.get($summary)
    //     .find('dd')
    //     .then(($summaryValues) => {
    //       cy.get($summaryValues).its('length').should('eq', 1)
    //       expect($summaryValues.get(0).innerText).to.contain('Started on 19 August 2021')
    //     })
    // })
    // })
    // })
  })
})
