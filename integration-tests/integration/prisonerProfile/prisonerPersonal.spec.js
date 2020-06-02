const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')

context('Prisoner personal', () => {
  const offenderNo = 'A12345'

  before(() => {
    cy.task('stubLogin', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.login()

    cy.task('stubPrisonerProfileHeaderData', {
      offenderBasicDetails,
      offenderFullDetails,
      iepSummary: {},
      caseNoteSummary: {},
    })
  })

  context('When there is no data', () => {
    const notEnteredText = 'Not entered'
    before(() => {
      cy.task('stubPersonal', {})
      cy.visit(`/prisoner/${offenderNo}/personal`)
    })

    context('Personal section', () => {
      it('Should show correct labels and values', () => {
        cy.get('[data-test="personal-summary"]').then($summary => {
          cy.get($summary)
            .find('dt')
            .then($summaryLabels => {
              cy.get($summaryLabels)
                .its('length')
                .should('eq', 15)
              expect($summaryLabels.get(0).innerText).to.contain('Age')
              expect($summaryLabels.get(1).innerText).to.contain('Date of Birth')
              expect($summaryLabels.get(2).innerText).to.contain('Place of Birth')
              expect($summaryLabels.get(3).innerText).to.contain('Gender')
              expect($summaryLabels.get(4).innerText).to.contain('Ethnicity')
              expect($summaryLabels.get(5).innerText).to.contain('Religion or belief')
              expect($summaryLabels.get(6).innerText).to.contain('Nationality')
              expect($summaryLabels.get(7).innerText).to.contain('Sexual orientation')
              expect($summaryLabels.get(8).innerText).to.contain('Marital status')
              expect($summaryLabels.get(9).innerText).to.contain('Number of children')
              expect($summaryLabels.get(10).innerText).to.contain('Smoker or vaper')
              expect($summaryLabels.get(11).innerText).to.contain('Interest to immigration')
              expect($summaryLabels.get(12).innerText).to.contain('Warned about tattooing')
              expect($summaryLabels.get(13).innerText).to.contain('Warned not to change appearance')
              expect($summaryLabels.get(14).innerText).to.contain('Property')
            })

          cy.get($summary)
            .find('dd')
            .then($summaryValues => {
              cy.get($summaryValues)
                .its('length')
                .should('eq', 15)
              expect($summaryValues.get(0).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(1).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(2).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(3).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(4).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(5).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(6).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(7).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(8).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(9).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(10).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(11).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(12).innerText).to.contain('Needs to be warned')
              expect($summaryValues.get(13).innerText).to.contain('Needs to be warned')
              expect($summaryValues.get(14).innerText).to.contain('None')
            })
        })
      })
    })

    context('Physical characteristics section', () => {
      it('Should show correct labels and values', () => {
        cy.get('[data-test="physical-characteristics-summary"]').then($summary => {
          cy.get($summary)
            .find('dt')
            .then($summaryLabels => {
              cy.get($summaryLabels)
                .its('length')
                .should('eq', 9)
              expect($summaryLabels.get(0).innerText).to.contain('Height')
              expect($summaryLabels.get(1).innerText).to.contain('Weight')
              expect($summaryLabels.get(2).innerText).to.contain('Hair colour')
              expect($summaryLabels.get(3).innerText).to.contain('Left eye colour')
              expect($summaryLabels.get(4).innerText).to.contain('Right eye colour')
              expect($summaryLabels.get(5).innerText).to.contain('Facial hair')
              expect($summaryLabels.get(6).innerText).to.contain('Shape of face')
              expect($summaryLabels.get(7).innerText).to.contain('Build')
              expect($summaryLabels.get(8).innerText).to.contain('Shoe size')
            })

          cy.get($summary)
            .find('dd')
            .then($summaryValues => {
              cy.get($summaryValues)
                .its('length')
                .should('eq', 9)
              expect($summaryValues.get(0).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(1).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(2).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(3).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(4).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(5).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(6).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(7).innerText).to.contain(notEnteredText)
              expect($summaryValues.get(8).innerText).to.contain(notEnteredText)
            })
        })
      })
    })

    context('Distinguishing marks section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="distinguishing-marks-summary"]').then($section => {
          expect($section).to.contain.text('None')
        })
      })
    })

    context('Languages section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="languages-summary"]').then($section => {
          expect($section).to.contain.text('No language entered')
        })
      })
    })

    context('Aliases section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="aliases-summary"]').then($section => {
          expect($section).to.contain.text('None')
        })
      })
    })

    context('Identifiers section', () => {
      it('Should show correct labels and values', () => {
        cy.get('[data-test="identifiers-summary"]').then($summary => {
          cy.get($summary)
            .find('dt')
            .then($summaryLabels => {
              cy.get($summaryLabels)
                .its('length')
                .should('eq', 1)
              expect($summaryLabels.get(0).innerText).to.contain('PNC number')
            })

          cy.get($summary)
            .find('dd')
            .then($summaryValues => {
              cy.get($summaryValues)
                .its('length')
                .should('eq', 1)
              expect($summaryValues.get(0).innerText).to.contain(notEnteredText)
            })
        })
      })
    })

    context('Addresses section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="addresses-summary"]').then($section => {
          expect($section).to.contain.text('No active, primary address entered')
        })
      })
    })

    context('Active contacts section', () => {
      it('Should show correct missing content text', () => {
        cy.get('[data-test="active-contacts-summary"]').then($section => {
          expect($section).to.contain.text('None')
        })
      })
    })
  })
})
