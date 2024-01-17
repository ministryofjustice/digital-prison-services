const prisonerQuickLookPage = require('../../pages/prisonerProfile/prisonerQuickLookPage')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { businessPrimary, businessNonPrimary, otherContacts } = require('./prisonerProfessionalContacts.cy')

context('Current prisoner profile should redirect to the new prisoner profile', () => {
  context('When the case load IS Leeds', () => {
    context('Overview page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubPrisonerProfile', {})
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'LEI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
      })
      it('Should redirect to the new prisoner profile - overview page', () => {
        cy.origin('http://localhost:9191', () => {
          const offenderNo = 'A1234A'
          cy.visit(`http://localhost:3008/prisoner/${offenderNo}`)
          cy.location().should((location) => {
            expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/`)
          })
          cy.get('h1').should('contain.text', 'New Prisoner Profile!')
          cy.get('h2').should('contain.text', 'Overview')
        })
      })
    })
    context('Personal page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubPrisonerProfilePersonal')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'LEI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
          iepSummary: {},
          caseNoteSummary: {},
        })

        cy.task('stubProfessionalContacts', {
          offenderBasicDetails,
          contacts: otherContacts,
          personAddresses: [businessPrimary, businessNonPrimary],
          personEmails: [{ email: 'test1@email.com' }, { email: 'test2@email.com' }],
          personPhones: [
            { number: '02222222222', type: 'MOB' },
            { number: '033333333333', type: 'BUS', ext: '123' },
          ],
          prisonOffenderManagers: {
            primary_pom: { staffId: 1, name: 'SMITH, JANE' },
            secondary_pom: { staffId: 2, name: 'DOE, JOHN' },
          },
        })
      })
      it('Should redirect to the new prisoner profile - personal page', () => {
        cy.origin('http://localhost:9191', () => {
          const offenderNo = 'A1234A'
          cy.visit(`http://localhost:3008/prisoner/${offenderNo}/personal`)

          cy.location().should((location) => {
            expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/personal`)
          })

          cy.get('h1').should('contain.text', 'New Prisoner Profile!')
          cy.get('h2').should('contain.text', 'Personal')
        })
      })
      context('Redirect to overview page', () => {
        before(() => {
          cy.task('stubPrisonerProfile', {})
        })
        it('Link should redirect to the new prisoner profile - overview page', () => {
          const offenderNo = 'A1234A'
          cy.visit(`http://localhost:3008/prisoner/${offenderNo}/professional-contacts`)
          cy.get('[data-test="return-to-profile-overview"]').should('be.visible')
          cy.get('[data-test="return-to-profile-overview"]').click()
          cy.get('h1').should('contain.text', 'New Prisoner Profile!')
          cy.get('h2').should('contain.text', 'Overview')
        })
      })
    })
    context('Case notes page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubPrisonerProfileCaseNotes')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'LEI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
          iepSummary: {},
          caseNoteSummary: {},
        })
      })
      it('Should redirect to the new prisoner profile - case notes page', () => {
        cy.origin('http://localhost:9191', () => {
          const offenderNo = 'A1234A'
          cy.visit(`http://localhost:3008/prisoner/${offenderNo}/case-notes`)

          cy.location().should((location) => {
            expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/case-notes`)
          })

          cy.get('h1').should('contain.text', 'New Prisoner Profile!')
          cy.get('h2').should('contain.text', 'Case notes')
        })
      })
    })
    context('Alerts page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubPrisonerProfileAlerts')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'LEI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
          iepSummary: {},
          caseNoteSummary: {},
        })
      })
      it('Should redirect to the new prisoner profile - alerts page', () => {
        cy.origin('http://localhost:9191', () => {
          const offenderNo = 'A1234A'
          cy.visit(`http://localhost:3008/prisoner/${offenderNo}/alerts`)

          cy.location().should((location) => {
            expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/alerts`)
          })

          cy.get('h1').should('contain.text', 'New Prisoner Profile!')
        })
      })
    })

    context('Offences page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubPrisonerProfileOffences')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'LEI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
          iepSummary: {},
          caseNoteSummary: {},
        })
      })
      it('Should redirect from sentence and release to the new prisoner profile - offences page', () => {
        cy.origin('http://localhost:9191', () => {
          const offenderNo = 'A1234A'
          cy.visit(`http://localhost:3008/prisoner/${offenderNo}/sentence-and-release`)

          cy.location().should((location) => {
            expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/offences`)
          })

          cy.get('h1').should('contain.text', 'New Prisoner Profile!')
          cy.get('h2').should('contain.text', 'Offences')
        })
      })
    })

    context('Work and skills page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubPrisonerProfileWorkAndSkills')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'LEI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
          iepSummary: {},
          caseNoteSummary: {},
        })
      })
      it('Should redirect to the new prisoner profile - work and skills page', () => {
        cy.origin('http://localhost:9191', () => {
          const offenderNo = 'A1234A'
          cy.visit(`http://localhost:3008/prisoner/${offenderNo}/work-and-skills`)

          cy.location().should((location) => {
            expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/work-and-skills`)
          })

          cy.get('h1').should('contain.text', 'New Prisoner Profile!')
          cy.get('h2').should('contain.text', 'Work and skills')
        })
      })
    })
  })
})

context('Current prisoner profile should NOT redirect to the new prisoner profile', () => {
  context('When the case load IS NOT Leeds', () => {
    context('Overview page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'MDI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
          iepSummary: {},
          caseNoteSummary: {},
          offenderNo: 'A1234A',
        })
      })
      it('Should not redirect to the new prisoner profile - overview page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}`)
        })

        prisonerQuickLookPage.verifyOnPage('Smith, John')
      })
    })
    context('Personal page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'MDI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
          iepSummary: {},
          caseNoteSummary: {},
          offenderNo: 'A1234A',
        })
        cy.task('stubPersonal', {})

        cy.task('stubProfessionalContacts', {
          offenderBasicDetails,
          contacts: otherContacts,
          personAddresses: [businessPrimary, businessNonPrimary],
          personEmails: [{ email: 'test1@email.com' }, { email: 'test2@email.com' }],
          personPhones: [
            { number: '02222222222', type: 'MOB' },
            { number: '033333333333', type: 'BUS', ext: '123' },
          ],
          prisonOffenderManagers: {
            primary_pom: { staffId: 1, name: 'SMITH, JANE' },
            secondary_pom: { staffId: 2, name: 'DOE, JOHN' },
          },
        })

        cy.task('stubPrisonerProfile', {})
      })
      it('Should not redirect to the new prisoner profile - personal page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/personal`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/personal`)
        })

        prisonerQuickLookPage.verifyOnPage('Smith, John')
      })
      it('Link should not redirect and land on the personal page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`http://localhost:3008/prisoner/${offenderNo}/professional-contacts`)
        cy.get('[data-test="return-to-profile-personal"]').should('be.visible')

        cy.get('[data-test="return-to-profile-personal"]').click()
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/personal`)
        })
      })
    })
    context('Alerts page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'MDI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails: { ...offenderFullDetails, agencyId: 'OUT' },
          iepSummary: {},
          caseNoteSummary: {},
          offenderNo: 'A1234A',
        })
        const activeAlerts = [
          {
            active: true,
            addedByFirstName: 'John',
            addedByLastName: 'Smith',
            alertCode: 'XC',
            alertCodeDescription: 'Risk to females',
            alertId: 1,
            alertType: 'X',
            alertTypeDescription: 'Security',
            bookingId: 14,
            comment: 'has a large poster on cell wall',
            dateCreated: '2019-08-20',
            dateExpires: null,
            expired: false,
            expiredByFirstName: 'John',
            expiredByLastName: 'Smith',
            offenderNo: 'G3878UK',
          },
        ]
        cy.task('stubAlertsForBooking', activeAlerts)
        cy.task('stubAlertTypes')
        cy.task('stubPathFinderOffenderDetails', null)
        cy.task('stubClientCredentialsRequest')
      })
      it('Should not redirect to the new prisoner profile - alerts page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/alerts`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/alerts`)
        })
      })
    })
    context('Sentence and release page', () => {
      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'MDI',
          caseloads: [],
          roles: [],
        })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails,
          iepSummary: {},
          caseNoteSummary: {},
          offenderNo: 'A1234A',
        })
        cy.task('stubOffenderBasicDetails', { bookingId: 1 })
        cy.task('stubPrisonerSearch')
        cy.task('stubClientCredentialsRequest')
        cy.task('stubSentenceAdjustments', {})
        cy.task('stubCourtCases', [])
        cy.task('stubOffenceHistory', [])
        cy.task('stubSentenceTerms', [])
        cy.task('stubReleaseDatesOffenderNo', {
          sentenceDetail: {
            sentenceStartDate: '2010-02-03',
            confirmedReleaseDate: '2020-04-20',
            releaseDate: '2020-04-01',
            nonDtoReleaseDateType: 'CRD',
            additionalDaysAwarded: 5,
            nonDtoReleaseDate: '2020-04-01',
            sentenceExpiryDate: '2020-02-19',
            automaticReleaseDate: '2020-01-01',
            conditionalReleaseDate: '2020-02-01',
            nonParoleDate: '2019-02-03',
            postRecallReleaseDate: '2021-02-03',
            licenceExpiryDate: '2020-02-04',
            homeDetentionCurfewEligibilityDate: '2019-07-03',
            paroleEligibilityDate: '2022-02-03',
            homeDetentionCurfewActualDate: '2021-06-02',
            actualParoleDate: '2020-04-03',
            releaseOnTemporaryLicenceDate: '2025-02-03',
            earlyRemovalSchemeEligibilityDate: '2018-11-12',
            tariffEarlyRemovalSchemeEligibilityDate: '2017-10-10',
            earlyTermDate: '2019-08-09',
            midTermDate: '2020-08-10',
            lateTermDate: '2021-08-11',
            topupSupervisionExpiryDate: '2020-10-14',
            tariffDate: '2021-05-07',
            dtoPostRecallReleaseDate: '2020-10-16',
          },
        })
      })
      it('Should not redirect to the new prisoner profile - sentence and release page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/sentence-and-release`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/sentence-and-release`)
          expect(location.pathname).to.not.eq(`/prisonerprofile/prisoner/${offenderNo}/sentence-and-release`)
        })
      })
    })
    context('Work and skills page', () => {
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
        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails,
          iepSummary: {},
          caseNoteSummary: {},
          offenderNo: 'A1234A',
        })
        cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
        cy.signIn()
        Cypress.Cookies.preserveOnce('hmpps-session-dev')
        cy.task('stubLatestLearnerAssessments', functionalSkillsAssessments)
      })
      it('Should not redirect to the new prisoner profile - work and skills page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/work-and-skills`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/work-and-skills`)
        })

        prisonerQuickLookPage.verifyOnPage('Smith, John')
      })
    })
    context('Case notes page', () => {
      const offenderNo = 'A12345'
      const caseNote = {
        caseNoteId: 12311312,
        offenderIdentifier: 'A1234AA',
        type: 'IEP',
        typeDescription: 'Incentive Level',
        subType: 'IEP_WARN',
        subTypeDescription: 'Incentive Level Warning',
        source: 'INST',
        creationDateTime: '2017-10-31T01:30:00',
        occurrenceDateTime: '2017-10-31T01:30:00',
        authorName: 'Mouse, Mickey',
        authorUserId: '12345',
        text: 'This is some text',
        locationId: 'MDI',
        amendments: [
          {
            caseNoteAmendmentId: 123232,
            sequence: 1,
            creationDateTime: '2018-12-01T13:45:00',
            authorUserName: 'USER1',
            authorName: 'Smith, John',
            additionalNoteText: 'Some Additional Text',
            authorUserId: 12345,
          },
        ],
        eventId: -23,
      }

      const replicate = ({ data, times }) =>
        Array(times)
          .fill()
          .map(() => data)

      before(() => {
        cy.clearCookies()
        cy.task('reset')
        cy.task('stubSignIn', {
          username: 'ITAG_USER',
          caseload: 'MDI',
          caseloads: [
            {
              caseLoadId: 'MDI',
              description: 'MOORLAND (HMP & YOI)',
              currentlyActive: true,
            },
          ],
          roles: ['ROLE_DELETE_SENSITIVE_CASE_NOTES'],
        })
        cy.signIn()
        cy.task('stubCaseNoteTypes')

        cy.task('stubPrisonerProfileHeaderData', {
          offenderBasicDetails,
          offenderFullDetails,
          iepSummary: {},
          caseNoteSummary: {},
        })
      })
      it('Should not redirect to the new prisoner profile - case notes page', () => {
        cy.task('stubCaseNotes', {
          totalElements: 21,
          content: replicate({ data: caseNote, times: 21 }),
        })
        cy.visit(`/prisoner/${offenderNo}/case-notes?pageOffsetOption=0`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/case-notes`)
          expect(location.pathname).to.not.eq(`/prisonerprofile/prisoner/${offenderNo}/case-notes`)
        })
      })
    })
  })
})
