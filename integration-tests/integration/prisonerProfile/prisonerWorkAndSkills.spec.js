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
    context('When there is no data because of an api call failure', () => {
      const apiErrorText = 'We cannot show these details right now. Try reloading the page.'
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubWorkAndSkillsApi500Errors')
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
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
      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)

        cy.task('stubWorkAndSkillsApi404Errors', error)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
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

      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubLatestLearnerAssessments', functionalSkillsAssessments)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
      })

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
      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubLatestLearnerAssessments', functionalSkillsAssessments)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
      })
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
              expect($summaryValues.get(2).innerText).to.contain('Moorland (HMP & YOI)')
              expect($summaryValues.get(3).innerText).to.contain('Level 1')
              expect($summaryValues.get(4).innerText).to.contain('20 May 2021')
              expect($summaryValues.get(5).innerText).to.contain('Moorland (HMP & YOI)')
              expect($summaryValues.get(6).innerText).to.contain('Level 2')
              expect($summaryValues.get(7).innerText).to.contain('19 May 2021')
              expect($summaryValues.get(8).innerText).to.contain('Moorland (HMP & YOI)')
            })
        })
      })
    })
  })

  context('goals section', () => {
    context('When there is no data because of an api call failure', () => {
      const apiErrorText = 'We cannot show these details right now. Try reloading the page.'
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubWorkAndSkillsApi500Errors')
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
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

      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)

        cy.task('stubWorkAndSkillsApi404Errors', error)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
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
      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubLearnerGoals', emptyGoals)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
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
      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubLearnerGoals', dummyGoals)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
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
    context('When there is no data because of an api call failure', () => {
      const apiErrorText = 'We cannot show these details right now. Try reloading the page.'

      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)

        cy.task('stubWorkAndSkillsApi500Errors')
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
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

      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)

        cy.task('stubWorkAndSkillsApi404Errors', error)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
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
      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubLearnerEducation', emptyCourses)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
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
      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubLearnerEducation', dummyEducation)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
      })
      it('should display the correct courses as labels, ordered by date', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="courses-currentCourses"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 2)
              expect($summaryLabels.get(0).innerText).to.contain('Running (prisoner temporarily withdrawn)')
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
  })
  context('work and activities section', () => {
    context('When there is no data because of an api call failure', () => {
      const apiErrorText = 'We cannot show these details right now. Try reloading the page.'

      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)

        cy.task('stubWorkAndSkillsApi500Errors')
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
      })

      it('should show correct error message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="work-errorMessage"]').should('have.text', apiErrorText)
        cy.get('[data-test="work-header"]').should('not.exist')
      })
    })
    context('When there is no data', () => {
      const emptyWork = {
        offenderNo: 'G9981UK',
        workActivities: [],
      }

      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubOffenderWorkHistory', emptyWork)
        cy.task('stubPrisonerDetails', prisonerDetails)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
      })

      it('should show default message', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="work-noData"]').then(($message) => {
          cy.get($message).then(($noCoursesMessage) => {
            cy.get($noCoursesMessage).should('have.text', 'John Smith has no work or activities.')
          })
        })
        cy.get('[data-test="work-scheduleLink"]').then(($workScheduleLink) => {
          cy.get($workScheduleLink).should('have.text', 'View 7 day schedule')
        })
        cy.get('[data-test="work-header"]').should('not.exist')
      })
    })
    context('When the user exists, they have no current work, but they have work history', () => {
      const dummyWorkHistory = {
        offenderNo: 'G6123VU',
        workActivities: [
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
      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubOffenderWorkHistory', dummyWorkHistory)
        cy.task('stubPrisonerDetails', prisonerDetails)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
      })

      it('it should display the correct content', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="work-noCurrent"]').then(($message) => {
          cy.get($message).then(($noCurrentCoursesMessage) => {
            cy.get($noCurrentCoursesMessage).should('have.text', 'John Smith has no current work or activities.')
          })
        })
        cy.get('[data-test="work-detailsLink"]').then(($workDetailsLink) => {
          cy.get($workDetailsLink).should('have.text', 'View work and activities for the last 12 months')
        })

        cy.get('[data-test="work-scheduleLink"]').then(($workScheduleLink) => {
          cy.get($workScheduleLink).should('have.text', 'View 7 day schedule')
        })
      })
    })
    context('When there is data available', () => {
      const dummyWorkHistory = {
        offenderNo: 'G6123VU',
        workActivities: [
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

      before(() => {
        cy.task('reset')
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()

        cy.task('stubPrisonerProfileHeaderData', prisonerProfileHeaderData)
        cy.task('stubOffenderWorkHistory', dummyWorkHistory)
        cy.task('stubPrisonerDetails', prisonerDetails)
      })

      beforeEach(() => {
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
      })

      it('should display the list of current jobs and their start dates when there are current jobs', () => {
        visitWorkAndSkillsAndExpandAccordions()
        cy.get('[data-test="work-header"]').then(($header) => {
          cy.get($header).should('have.text', 'Current activities')
        })
        cy.get('[data-test="work-summary"]').then(($summary) => {
          cy.get($summary)
            .find('dt')
            .then(($summaryLabels) => {
              cy.get($summaryLabels).its('length').should('eq', 2)
              expect($summaryLabels.get(0).innerText).to.contain('Cleaner HB1 AM')
              expect($summaryLabels.get(1).innerText).to.contain('Cleaner HB1 PM')
            })

          cy.get($summary)
            .find('dd')
            .then(($summaryValues) => {
              cy.get($summaryValues).its('length').should('eq', 2)
              expect($summaryValues.get(0).innerText).to.contain('Started on 19 August 2021')
              expect($summaryValues.get(1).innerText).to.contain('Started on 20 July 2021')
            })

          cy.get('[data-test="work-detailsLink"]').then(($workDetailsLink) => {
            cy.get($workDetailsLink).should('have.text', 'View work and activities for the last 12 months')
          })

          cy.get('[data-test="work-scheduleLink"]').then(($workScheduleLink) => {
            cy.get($workScheduleLink).should('have.text', 'View 7 day schedule')
          })
        })
      })
    })
  })
})
