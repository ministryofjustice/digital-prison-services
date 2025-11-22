const noCaseloadPage = require('../../pages/prisonerProfile/noCaseloads')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { businessPrimary, businessNonPrimary, otherContacts } = require('./prisonerProfessionalContacts')

context('Current prisoner profile should redirect to the new prisoner profile', () => {
  context('When the case load IS Leeds', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubPrisonerProfile', {})
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: 'LEI',
        caseloads: [],
        roles: [],
      })
      cy.session('hmpps-session-dev-redirect', () => {
        cy.clearCookies()
        cy.signIn()
      })
    })

    context('Overview page', () => {
      it('Should redirect to the new prisoner profile - overview page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`http://localhost:3008/prisoner/${offenderNo}`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/`)
        })
        cy.get('h1').should('contain.text', 'New Prisoner Profile!')
        cy.get('h2').should('contain.text', 'Overview')
      })
    })

    context('Personal page', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfilePersonal')
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
        })
      })

      it('Should redirect to the new prisoner profile - personal page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`http://localhost:3008/prisoner/${offenderNo}/personal`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/personal`)
        })

        cy.get('h1').should('contain.text', 'New Prisoner Profile!')
        cy.get('h2').should('contain.text', 'Personal')
      })
    })

    context('Case notes page', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileCaseNotes')
      })

      it('Should redirect to the new prisoner profile - case notes page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`http://localhost:3008/prisoner/${offenderNo}/case-notes`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/case-notes`)
        })

        cy.get('h1').should('contain.text', 'New Prisoner Profile!')
        cy.get('h2').should('contain.text', 'Case notes')
      })
    })

    context('Add case note page', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileAddCaseNote')
      })

      it('Should redirect to the new prisoner profile - add case note page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`http://localhost:3008/prisoner/${offenderNo}/add-case-note`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/add-case-note`)
        })

        cy.get('h1').should('contain.text', 'New Prisoner Profile!')
        cy.get('h2').should('contain.text', 'Add case note')
      })
    })

    context('Alerts page', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileAlerts')
      })

      it('Should redirect to the new prisoner profile - alerts page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`http://localhost:3008/prisoner/${offenderNo}/alerts`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/alerts`)
        })

        cy.get('h1').should('contain.text', 'New Prisoner Profile!')
      })
    })

    context('Offences page', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileOffences')
      })

      it('Should redirect from sentence and release to the new prisoner profile - offences page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`http://localhost:3008/prisoner/${offenderNo}/sentence-and-release`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/offences`)
        })

        cy.get('h1').should('contain.text', 'New Prisoner Profile!')
        cy.get('h2').should('contain.text', 'Offences')
      })
    })

    context('Work and skills page', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileWorkAndSkills')
      })

      it('Should redirect to the new prisoner profile - work and skills page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`http://localhost:3008/prisoner/${offenderNo}/work-and-skills`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/work-and-skills`)
        })

        cy.get('h1').should('contain.text', 'New Prisoner Profile!')
        cy.get('h2').should('contain.text', 'Work and skills')
      })
    })

    context('Cell history page', () => {
      beforeEach(() => {
        cy.task('stubPrisonerProfileLocationDetails')
      })

      it('Should redirect to the new prisoner profile - location details page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`http://localhost:3008/prisoner/${offenderNo}/cell-history`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisonerprofile/prisoner/${offenderNo}/location-details`)
        })

        cy.get('h1').should('contain.text', 'New Prisoner Profile!')
        cy.get('h2').should('contain.text', 'Location details')
      })
    })
  })
})

context('Current prisoner profile should NOT redirect to the new prisoner profile', () => {
  context('When the user has no caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.task('stubSignIn', {
        username: 'ITAG_USER',
        caseload: null,
        caseloads: [],
      })
      cy.session('hmpps-session-dev-nocaseload', () => {
        cy.clearCookies()
        cy.signIn()
      })
    })

    context('Overview page', () => {
      it('Should display no caseload page - overview page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}`)
        })

        noCaseloadPage.verifyOnPage()
      })
    })

    context('Personal page', () => {
      it('Should display no caseload page - personal page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/personal`)

        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/personal`)
        })

        noCaseloadPage.verifyOnPage()
      })
    })

    context('Alerts page', () => {
      it('Should display no caseload page - alerts page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/alerts`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/alerts`)
        })

        noCaseloadPage.verifyOnPage()
      })
    })

    context('Sentence and release page', () => {
      it('Should display no caseload page - sentence and release page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/sentence-and-release`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/sentence-and-release`)
        })

        noCaseloadPage.verifyOnPage()
      })
    })

    context('Work and skills page', () => {
      it('Should display no caseload page - work and skills page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/work-and-skills`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/work-and-skills`)
        })

        noCaseloadPage.verifyOnPage()
      })
    })

    context('Case notes page', () => {
      it('Should display no caseload page - case notes page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/case-notes?pageOffsetOption=0`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/case-notes`)
        })

        noCaseloadPage.verifyOnPage()
      })
    })

    context('Add case notes page', () => {
      it('Should display no caseload page - case notes page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/add-case-note`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/add-case-note`)
        })

        noCaseloadPage.verifyOnPage()
      })
    })

    context('Cell history page', () => {
      it('Should display no caseload page - cell history page', () => {
        const offenderNo = 'A1234A'
        cy.visit(`/prisoner/${offenderNo}/cell-history`)
        cy.location().should((location) => {
          expect(location.pathname).to.eq(`/prisoner/${offenderNo}/cell-history`)
        })

        noCaseloadPage.verifyOnPage()
      })
    })
  })
})
