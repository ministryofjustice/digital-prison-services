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

  const prisonerDetails = [
    {
      offenderNo: 'G6123VU',
      firstName: 'JOHN',
      lastName: 'SAUNDERS',
      dateOfBirth: '1990-10-12',
      gender: 'Male',
      sexCode: 'M',
      nationalities: 'multiple nationalities field',
      currentlyInPrison: 'Y',
      latestBookingId: 1102484,
      latestLocationId: 'MDI',
      latestLocation: 'Moorland (HMP & YOI)',
      internalLocation: 'MDI-3-2-026',
      pncNumber: '08/359381C',
      croNumber: '400862/08W',
      ethnicity: 'White: Eng./Welsh/Scot./N.Irish/British',
      ethnicityCode: 'W1',
      birthCountry: 'England',
      religion: 'Celestial Church of God',
      religionCode: 'CCOG',
      convictedStatus: 'Convicted',
      legalStatus: 'RECALL',
      imprisonmentStatus: 'CUR_ORA',
      imprisonmentStatusDesc: 'ORA Recalled from Curfew Conditions',
      receptionDate: '2016-05-30',
      maritalStatus: 'No',
    },
  ]

  context('functional skills section', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.clearCookies()
      cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
    })

    context('When there is no data because of an api call failure', () => {
      const apiErrorText = 'We cannot show these details right now. Try reloading the page.'

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubWorkAndSkillsApi500Errors')
      })

      it('should show correct error message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="learner-latest-assessments-errorMessage"]').should('have.text', apiErrorText)
      })
    })

    context('When the prisoner is not in Curious', () => {
      const error = {
        errorCode: 'VC404',
        errorMessage: 'Resource not found',
        httpStatusCode: 404,
      }

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubWorkAndSkillsApi404Errors', error)
      })

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

    context('When there is no data', () => {
      const functionalSkillsAssessments = [
        {
          prn: 'G1670VU',
          qualifications: [],
        },
      ]

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubLatestLearnerAssessments', functionalSkillsAssessments)
      })

      it('should show three subjects in the correct format and awaiting assessments content', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dl')
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 3)
              expect($summaryLabels.get(0).textContent).to.contain('English')
              expect($summaryLabels.get(1)).to.contain('Maths')
              expect($summaryLabels.get(2)).to.contain('Digital Literacy')
            })
        })
      })
    })

    context('When there is data available', () => {
      const functionalSkillsAssessments = [
        {
          prn: 'G6123VU',
          qualifications: [
            {
              establishmentId: 'MDI',
              establishmentName: 'MOORLAND (HMP & YOI)',
              qualification: {
                qualificationType: 'English',
                qualificationGrade: 'Level 1',
                assessmentDate: '2021-05-13',
              },
            },
            {
              establishmentId: 'MDI',
              establishmentName: 'MOORLAND (HMP & YOI)',
              qualification: {
                qualificationType: 'Maths',
                qualificationGrade: 'Level 1',
                assessmentDate: '2021-05-20',
              },
            },
            {
              establishmentId: 'MDI',
              establishmentName: 'MOORLAND (HMP & YOI)',
              qualification: {
                qualificationType: 'Digital Literacy',
                qualificationGrade: 'Level 2',
                assessmentDate: '2021-05-19',
              },
            },
          ],
        },
      ]

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubLatestLearnerAssessments', functionalSkillsAssessments)
      })
      it('should have the correct labels and values', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="functional-skills-level-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dl')
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 9)
              expect($summaryLabels.get(0).textContent).to.contain('English')
              expect($summaryLabels.get(1).textContent).to.contain('Assessment date')
              expect($summaryLabels.get(2).textContent).to.contain('Assessment location')
              expect($summaryLabels.get(3).textContent).to.contain('Maths')
              expect($summaryLabels.get(4).textContent).to.contain('Assessment date')
              expect($summaryLabels.get(5).textContent).to.contain('Assessment location')
              expect($summaryLabels.get(6).textContent).to.contain('Digital Literacy')
              expect($summaryLabels.get(7).textContent).to.contain('Assessment date')
              expect($summaryLabels.get(8).textContent).to.contain('Assessment location')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 9)
              expect($summaryValues.get(0).textContent).to.contain('Level 1')
              expect($summaryValues.get(1).textContent).to.contain('13 May 2021')
              expect($summaryValues.get(2).textContent).to.contain('Moorland (HMP & YOI)')
              expect($summaryValues.get(3).textContent).to.contain('Level 1')
              expect($summaryValues.get(4).textContent).to.contain('20 May 2021')
              expect($summaryValues.get(5).textContent).to.contain('Moorland (HMP & YOI)')
              expect($summaryValues.get(6).textContent).to.contain('Level 2')
              expect($summaryValues.get(7).textContent).to.contain('19 May 2021')
              expect($summaryValues.get(8).textContent).to.contain('Moorland (HMP & YOI)')
            })
        })
      })
    })
  })

  context('goals section', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
    })

    context('When there is no data because of an api call failure', () => {
      const apiErrorText = 'We cannot show these details right now. Try reloading the page.'

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubWorkAndSkillsApi500Errors')
      })
      it('should show correct error message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="goals-errorMessage"]').should('have.text', apiErrorText)
      })
    })
    context('When the prisoner is not in Curious', () => {
      const error = {
        errorCode: 'VC404',
        errorMessage: 'Resource not found',
        httpStatusCode: 404,
      }

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubWorkAndSkillsApi404Errors', error)
      })

      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="goals-noGoals"]').then(($message) => {
          cy.get($message).then(($goalsMessage) => {
            cy.get($goalsMessage).should('have.text', 'John Smith has not set any goals.')
          })
        })
      })
    })
    context('When there is no data', () => {
      const emptyGoals = {
        prn: 'G9981UK',
        employmentGoals: [],
        personalGoals: [],
        longTermGoals: [],
        shortTermGoals: [],
      }

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubLearnerGoals', emptyGoals)
      })
      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="goals-noGoals"]').then(($message) => {
          cy.get($message).then(($goalsMessage) => {
            cy.get($goalsMessage).should('have.text', 'John Smith has not set any goals.')
          })
        })
      })
    })
    context('When there is data available', () => {
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

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubLearnerGoals', dummyGoals)
      })
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
  })

  context('courses and qualifications section', () => {
    beforeEach(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
    })

    context('When there is no data because of an api call failure', () => {
      const apiErrorText = 'We cannot show these details right now. Try reloading the page.'

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubWorkAndSkillsApi500Errors')
      })

      it('should show correct error message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="courses-errorMessage"]').should('have.text', apiErrorText)
      })
    })

    context('When the prisoner is not in Curious', () => {
      const error = {
        errorCode: 'VC404',
        errorMessage: 'Resource not found',
        httpStatusCode: 404,
      }

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubWorkAndSkillsApi404Errors', error)
      })

      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="courses-noData"]').then(($message) => {
          cy.get($message).then(($noCoursesMessage) => {
            cy.get($noCoursesMessage).should('have.text', 'John Smith has no courses or qualifications.')
          })
        })
      })
    })

    context('When there is no data', () => {
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

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubLearnerEducation', emptyCourses)
      })

      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="courses-noData"]').then(($message) => {
          cy.get($message).then(($noCoursesMessage) => {
            cy.get($noCoursesMessage).should('have.text', 'John Smith has no courses or qualifications.')
          })
        })
      })
    })

    context('When there is data available', () => {
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
            completionStatus: 'Learner has temporarily withdrawn from the aim due to an agreed break in learning',
          },
          {
            prn: 'G6123VU',
            courseName: 'Cycling',
            learningPlannedEndDate: '2022-04-30',
            completionStatus: 'The learner has withdrawn from the learning activities leading to the learning aim',
          },
        ],
      }

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubLearnerEducation', dummyEducation)
      })
      it('should display the correct courses as labels, ordered by date', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="courses-currentCourses"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 2)
              expect($summaryLabels.get(0).textContent).to.contain('Running (prisoner temporarily withdrawn)')
              expect($summaryLabels.get(1).textContent).to.contain('Pink')
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
              expect($summaryValues.get(0).textContent).to.contain('Planned end date on 1 January 2022')
              expect($summaryValues.get(1).textContent).to.contain('Planned end date on 27 February 2022')
            })
        })
      })
      it('should display the link to the details page if there are historical courses', () => {
        visitWorkAndSkillsAndExpandAccordions()

        cy.get('[data-test="courses-detailsLink"]').then(($link) => {
          cy.get($link).should('have.text', 'View full course history')
        })
      })
    })
  })

  context('work and activities section', () => {
    beforeEach(() => {
      clickIfExist('a[href="/auth/sign-out"]') // cy.visit('/auth/sign-out')
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'BLI',
        caseloads: [
          {
            caseLoadId: 'BLI',
            description: 'Bristol',
            currentlyActive: true,
          },
        ],
      })
      cy.signIn()
    })

    context('When there is no data because of an api call failure', () => {
      const apiErrorText = 'We cannot show these details right now. Try reloading the page.'

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubWorkAndSkillsApi500Errors')
      })

      it('should show correct error message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="work-errorMessage"]').should('have.text', apiErrorText)
        cy.get('[data-test="work-header"]').should('not.exist')
      })
    })

    context('When there is no data', () => {
      const emptyWork = {
        content: [],
      }

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubOffenderWorkHistory', emptyWork)
        cy.task('stubPrisonerDetails', prisonerDetails)
      })

      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="work-noData"]').then(($message) => {
          cy.get($message).then(($noCoursesMessage) => {
            cy.get($noCoursesMessage).should('have.text', 'John Smith has no work or activities.')
          })
        })
        cy.get('[data-test="work-scheduleLink"]').then(($workScheduleLink) => {
          cy.get($workScheduleLink).contains('View 7 day schedule')
        })
        cy.get('[data-test="work-header"]').should('not.exist')
      })
    })

    context('When the user exists, they have no current work, but they have work history', () => {
      const dummyWorkHistory = {
        content: [
          {
            bookingId: 1102484,
            agencyLocationId: 'MDI',
            agencyLocationDescription: 'Moorland (HMP & YOI)',
            description: 'Cleaner HB1 AM',
            startDate: '2021-08-19',
            endDate: '2021-05-21',
            isCurrentActivity: false,
          },
          {
            bookingId: 1102484,
            agencyLocationId: 'MDI',
            agencyLocationDescription: 'Moorland (HMP & YOI)',
            description: 'Cleaner HB1 AM',
            startDate: '2021-07-20',
            endDate: '2021-07-23',
            isCurrentActivity: false,
          },
          {
            bookingId: 1102484,
            agencyLocationId: 'MDI',
            agencyLocationDescription: 'Moorland (HMP & YOI)',
            description: 'Cleaner HB1 PM',
            startDate: '2021-07-20',
            isCurrentActivity: false,
          },
        ],
      }

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubOffenderWorkHistory', dummyWorkHistory)
        cy.task('stubPrisonerDetails', prisonerDetails)
        cy.task('stubGetUnacceptableAbsenceCount', { offenderNo: 'G6123VU', unacceptableAbsence: 4 })
      })

      it('it should display the correct content', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="work-noCurrent"]').then(($message) => {
          cy.get($message).then(($noCurrentCoursesMessage) => {
            cy.get($noCurrentCoursesMessage).should('have.text', 'John Smith has no current work or activities.')
          })
        })
        cy.get('[data-test="work-detailsLink"]').then(($workDetailsLink) => {
          cy.get($workDetailsLink).contains('View work and activities for the last 12 months')
        })

        cy.get('[data-test="work-scheduleLink"]').then(($workScheduleLink) => {
          cy.get($workScheduleLink).contains('View 7 day schedule')
        })

        cy.get('[data-test="work-unacceptableAbsence"]').contains('Last 30 days')
        cy.get('[data-test="work-unacceptableAbsence"]').contains('4')
        cy.get('[data-test="work-absencesLink"]').contains('View unacceptable absences for the last 6 months')
      })
    })

    context('When there is data available', () => {
      const dummyWorkHistory = {
        content: [
          {
            bookingId: 1102484,
            agencyLocationId: 'MDI',
            agencyLocationDescription: 'Moorland (HMP & YOI)',
            description: 'Cleaner HB1 AM',
            startDate: '2021-08-19',
            isCurrentActivity: true,
          },
          {
            bookingId: 1102484,
            agencyLocationId: 'MDI',
            agencyLocationDescription: 'Moorland (HMP & YOI)',
            description: 'Cleaner HB1 AM',
            startDate: '2021-07-20',
            endDate: '2021-07-23',
            isCurrentActivity: false,
          },
          {
            bookingId: 1102484,
            agencyLocationId: 'MDI',
            agencyLocationDescription: 'Moorland (HMP & YOI)',
            description: 'Cleaner HB1 PM',
            startDate: '2021-07-20',
            isCurrentActivity: true,
          },
          {
            bookingId: 1102484,
            agencyLocationId: 'MDI',
            agencyLocationDescription: 'Wayland (HMP)',
            description: 'Library PM',
            startDate: '2020-02-01',
            isCurrentActivity: true,
          },
        ],
      }

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubOffenderWorkHistory', dummyWorkHistory)
        cy.task('stubPrisonerDetails', prisonerDetails)
        cy.task('stubGetUnacceptableAbsenceCount', { offenderNo: 'G6123VU', unacceptableAbsence: 0 })
      })

      it('should display the list of current jobs and their start dates when there are current jobs', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="work-header"]').then(($header) => {
          cy.get($header).should('contain', 'Current activities')
        })
        cy.get('[data-test="work-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 3)
              expect($summaryLabels.get(0).textContent).to.contain('Cleaner HB1 AM')
              expect($summaryLabels.get(1).textContent).to.contain('Cleaner HB1 PM')
              expect($summaryLabels.get(2).textContent).to.contain('Last 30 days')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 3)
              expect($summaryValues.get(0).textContent).to.contain('Started on 19 August 2021')
              expect($summaryValues.get(1).textContent).to.contain('Started on 20 July 2021')
              expect($summaryValues.get(2).textContent).to.contain('0')
            })

          cy.get('[data-test="work-detailsLink"]').then(($workDetailsLink) => {
            cy.get($workDetailsLink).contains('View work and activities for the last 12 months')
          })

          cy.get('[data-test="work-scheduleLink"]').then(($workScheduleLink) => {
            cy.get($workScheduleLink).contains('View 7 day schedule')
          })
          cy.get('[data-test="work-absencesLink"]').should('not.exist')
          cy.get('[data-test="work-summary"]').contains('John Smith has no unacceptable absences in the last 6 months')
        })
      })

      it('should hide unacceptable absences in a non-accelerator prison', () => {
        cy.contains('Sign out').click()
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'MDI',
          caseloads: [
            {
              caseLoadId: 'MDI',
              description: 'Moorland',
              currentlyActive: true,
            },
          ],
        })
        cy.signIn()

        visitWorkAndSkillsAndExpandAccordions()
        cy.contains('Unacceptable absences').should('not.exist')
      })
    })
  })

  context('employability skills section', () => {
    beforeEach(() => {
      clickIfExist('a[href="/auth/sign-out"]')
      cy.task('reset')
      cy.clearCookies()
      cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'LII',
        caseloads: [
          {
            caseLoadId: 'LII',
            description: 'Lincoln',
            currentlyActive: true,
          },
        ],
      })
      cy.signIn()
    })

    context('When there is no data because of an api call failure', () => {
      const apiErrorText = 'We cannot show these details right now. Try reloading the page.'

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubWorkAndSkillsApi500Errors')
      })

      it('should show correct error message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="employabilitySkills-errorMessage"]').should('have.text', apiErrorText)
      })
    })

    context('When there is data available', () => {
      const review1 = {
        reviewDate: '2021-05-29',
        currentProgression: '3 - Acceptable demonstration',
        comment: 'test 1',
      }
      const review2 = {
        reviewDate: '2021-06-29',
        currentProgression: '2 - Minimal demonstration',
        comment: 'test 1',
      }
      const employabilitySkillsData = {
        content: [
          {
            employabilitySkill: 'Problem Solving',
            reviews: [review1],
          },
          {
            employabilitySkill: 'Adaptability',
            reviews: [review2],
          },
        ],
      }

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubLearnerEmployabilitySkills', employabilitySkillsData)
      })

      it('should display the correct skill levels', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="employability-skills-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 10)
              expect($summaryLabels.get(0).textContent).to.contain('Adaptability')
              expect($summaryLabels.get(1).textContent).to.contain('Communication')
              expect($summaryLabels.get(6).textContent).to.contain('Problem solving')
            })
        })
        cy.get('[data-test="employability-skills-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 10)
              expect($summaryValues.get(0).textContent).to.contain('2 - Minimal demonstration')
              expect($summaryValues.get(1).textContent).to.contain('Not assessed')
              expect($summaryValues.get(6).textContent).to.contain('3 - Acceptable demonstration')
            })
        })
      })

      it('should hide employability in a non-accelerator prison', () => {
        cy.contains('Sign out').click()
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'MDI',
          caseloads: [
            {
              caseLoadId: 'MDI',
              description: 'Moorland',
              currentlyActive: true,
            },
          ],
        })
        cy.signIn()

        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="employability-skills-summary"]').should('not.exist')
      })
    })
  })
})
