const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { quickLookFullDetails } = require('../prisonerProfile/prisonerQuickLook.spec')
const {
  NeurodivergenceSelfDeclared,
  NeurodivergenceAssessed,
  NeurodivergenceSupport,
} = require('../../../backend/api/curious/types/Enums')

context('Prisoner search', () => {
  const inmate1 = {
    bookingId: 1,
    offenderNo: 'A1234BC',
    firstName: 'JOHN',
    lastName: 'SAUNDERS',
    dateOfBirth: '1990-10-12',
    age: 29,
    agencyId: 'MDI',
    assignedLivingUnitId: 1,
    assignedLivingUnitDesc: 'UNIT-1',
    categoryCode: 'A',
    alertsDetails: ['XA', 'XVL'],
  }
  const inmate1Iep = {
    bookingId: 1,
    iepLevel: 'Standard',
  }
  const inmate2 = {
    bookingId: 2,
    offenderNo: 'B4567CD',
    firstName: 'STEVE',
    lastName: 'SMITH',
    dateOfBirth: '1989-11-12',
    age: 30,
    agencyId: 'MDI',
    assignedLivingUnitId: 2,
    assignedLivingUnitDesc: 'UNIT-2',
    categoryCode: 'C',
    alertsDetails: ['RSS', 'XC'],
  }
  const inmate2Iep = {
    bookingId: 2,
    iepLevel: 'Standard',
  }

  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
    cy.signIn()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
  })

  context('When there are no search values', () => {
    beforeEach(() => {
      cy.task('stubUserLocations')
    })

    it('should display correct prisoner information', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 2,
        data: [inmate1, inmate2],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
      cy.visit(`/prisoner-search`)

      cy.get('[data-test="prisoner-search-results-table"]').then(($table) => {
        cy.get($table)
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).its('length').should('eq', 3) // 2 results plus table header
            expect($tableRows.get(1).innerText).to.contain(
              '\tSaunders, John\tA1234BC\tUNIT-1\tStandard\t29\t\nARSONIST\n\nCAT A'
            )
            expect($tableRows.get(2).innerText).to.contain('\tSmith, Steve\tB4567CD\tUNIT-2\tStandard\t30\t')
          })
      })
    })
  })

  context('When there are search values', () => {
    beforeEach(() => {
      cy.task('stubUserLocations')
    })

    it('should have correct data pre filled from search query', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 1,
        data: [inmate1],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep])
      cy.visit(`/prisoner-search?keywords=Saunders&location=MDI&alerts%5B%5D=XA`)

      cy.get('[data-test="prisoner-search-keywords"]').should('have.value', 'Saunders')
      cy.get('[data-test="prisoner-search-location"]').should('have.value', 'MDI')
      cy.get('[data-test="prisoner-search-alerts-container"]').should('have.attr', 'open')
      cy.get('[data-test="prisoner-search-alerts"]').then(($alerts) => {
        cy.get($alerts)
          .find('input')
          .then(($inputs) => {
            cy.get($inputs.get(2)).should('have.attr', 'checked')
          })
      })
    })

    it('should clear be able to clear selected alerts', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 1,
        data: [inmate1],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep])
      cy.visit(`/prisoner-search?keywords=Saunders&location=MDI&alerts%5B%5D=XA`)

      cy.get('[data-test="prisoner-search-alerts"]').then(($alerts) => {
        cy.get($alerts)
          .find('input')
          .then(($inputs) => {
            cy.get($inputs.get(2)).should('have.attr', 'checked')
          })
      })

      cy.get('[data-test="prisoner-search-clear-alerts"]').click()
      cy.get('[data-test="prisoner-search-form"]').submit()
      cy.get('[data-test="prisoner-search-alerts-container"]').should('not.have.attr', 'open')
      cy.get('[data-test="prisoner-search-alerts"]').then(($alerts) => {
        cy.get($alerts)
          .find('input')
          .then(($inputs) => {
            cy.get($inputs.get(2)).should('not.have.attr', 'checked')
          })
      })
    })

    it('should show correct order options for list view', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 2,
        data: [inmate1, inmate2],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
      cy.visit(`/prisoner-search`)

      cy.get('[data-test="prisoner-search-order"]').then(($select) => {
        cy.get($select)
          .find('option')
          .then(($options) => {
            cy.get($options).its('length').should('eq', 6)
            cy.get($options.get(0)).should('have.value', 'lastName,firstName:ASC')
            cy.get($options.get(1)).should('have.value', 'lastName,firstName:DESC')
            cy.get($options.get(2)).should('have.value', 'assignedLivingUnitDesc:ASC')
            cy.get($options.get(3)).should('have.value', 'assignedLivingUnitDesc:DESC')
            cy.get($options.get(4)).should('have.value', 'dateOfBirth:DESC')
            cy.get($options.get(5)).should('have.value', 'dateOfBirth:ASC')
          })
      })
    })

    it('should show view all results link and then hide when clicked', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 2,
        data: [inmate1, inmate2],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
      cy.visit(`/prisoner-search?pageLimitOption=1`)

      cy.get('[data-test="prisoner-search-view-all-link"]').then(($link) => {
        cy.get($link).should('contain.text', 'View all results').click()
        cy.get($link).should('not.exist')
      })
    })

    it('should show correct order options for grid view', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 2,
        data: [inmate1, inmate2],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
      cy.visit(`/prisoner-search?view=grid`)

      cy.get('[data-test="prisoner-search-order"]').then(($select) => {
        cy.get($select)
          .find('option')
          .then(($options) => {
            cy.get($options).its('length').should('eq', 4)
            cy.get($options.get(0)).should('have.value', 'lastName,firstName:ASC')
            cy.get($options.get(1)).should('have.value', 'lastName,firstName:DESC')
            cy.get($options.get(2)).should('have.value', 'assignedLivingUnitDesc:ASC')
            cy.get($options.get(3)).should('have.value', 'assignedLivingUnitDesc:DESC')
          })
      })
    })

    it('should have the correct link to the prisoner profile', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 2,
        data: [inmate1, inmate2],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
      cy.visit(`/prisoner-search?view=grid`)

      cy.get('[data-test="prisoner-profile-link"]').then(($prisonerProfileLinks) => {
        cy.get($prisonerProfileLinks).its('length').should('eq', 2)
        cy.get($prisonerProfileLinks.get(0)).should('have.attr', 'href').should('include', '/prisoner/A1234BC')
        cy.get($prisonerProfileLinks.get(1)).should('have.attr', 'href').should('include', '/prisoner/B4567CD')
      })
    })

    it('should maintain search options when sorting', () => {
      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 2,
        data: [inmate1, inmate2],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
      cy.visit(`/prisoner-search?keywords=Saunders&location=MDI&alerts%5B%5D=XA`)

      cy.get('[data-test="prisoner-search-order"]').select('assignedLivingUnitDesc:ASC')
      cy.get('[data-test="prisoner-search-order-form-submit"]').should('contain.text', 'Reorder')
      cy.get('[data-test="prisoner-search-order-form"]').submit()

      cy.get('[data-test="prisoner-search-keywords"]').should('have.value', 'Saunders')
      cy.get('[data-test="prisoner-search-location"]').should('have.value', 'MDI')
      cy.get('[data-test="prisoner-search-alerts-container"]').should('have.attr', 'open')
      cy.get('[data-test="prisoner-search-alerts"]').then(($alerts) => {
        cy.get($alerts)
          .find('input')
          .then(($inputs) => {
            cy.get($inputs.get(2)).should('have.attr', 'checked')
          })
      })

      cy.location().should((loc) => {
        expect(loc.search).to.eq(
          '?keywords=Saunders&location=MDI&alerts%5B%5D=XA&sortFieldsWithOrder=assignedLivingUnitDesc%3AASC'
        )
      })
    })

    it('should show the correct most recent search link when visiting a profile page from search', () => {
      const searchUrl = '/prisoner-search?keywords=Saunders&location=MDI&alerts%5B%5D=XA'

      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 1,
        data: [inmate1],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep])
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: [inmate1Iep],
        caseNoteSummary: {},
        offenderNo: 'A12345',
      })
      cy.task('stubQuickLook', quickLookFullDetails)
      cy.task('stubPathFinderOffenderDetails', null)
      cy.task('stubClientCredentialsRequest')
      cy.visit(searchUrl)

      cy.get('[data-test="prisoner-search-results-table"]').then(($table) => {
        cy.get($table)
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).find('a').click()
          })
      })

      cy.get('[data-test="recent-search-link"]').should('have.attr', 'href', searchUrl)
    })
  })

  context('Neurodiversity flag', () => {
    // eslint-disable-next-line no-script-url
    const neurodivergenceLink = `javascript:expandLink('/prisoner/A1234BC/personal')`
    const neurodivergenceAll = {
      prn: 'A12345',
      establishmentId: 'MDI',
      establishmentName: 'HMP Moorland',
      neurodivergenceSelfDeclared: [NeurodivergenceSelfDeclared.ADHD, NeurodivergenceSelfDeclared.Autism],
      selfDeclaredDate: '2022-02-10',
      neurodivergenceAssessed: [NeurodivergenceAssessed.AcquiredBrainInjury],
      assessmentDate: '2022-02-15',
      neurodivergenceSupport: [NeurodivergenceSupport.MemorySupport, NeurodivergenceSupport.Reading],
      supportDate: '2022-02-20',
    }
    beforeEach(() => {
      cy.task('stubUserLocations')
    })

    it('should display correct result including neurodiversity flag', () => {
      const searchUrl = '/prisoner-search?keywords=Saunders&location=MDI&alerts%5B%5D=XA'

      cy.task('stubInmates', {
        locationId: 'MDI',
        count: 1,
        data: [inmate1],
      })
      cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep])
      cy.task('stubPrisonerProfileHeaderData', {
        offenderBasicDetails,
        offenderFullDetails,
        iepSummary: [inmate1Iep],
        caseNoteSummary: {},
        offenderNo: 'A12345',
      })
      cy.task('stubQuickLook', quickLookFullDetails)
      cy.task('stubPathFinderOffenderDetails', null)
      cy.task('stubClientCredentialsRequest')
      cy.task('stubLearnerNeurodiversity', [neurodivergenceAll])

      cy.visit(searchUrl)

      cy.get('[data-test="prisoner-search-results-table"]').then(($table) => {
        cy.get($table)
          .find('tr')
          .then(($tableRows) => {
            cy.get($tableRows).find('a').click()
          })
      })
      cy.get('[data-test="view-neurodivergence-link"').should('have.attr', 'href', neurodivergenceLink)
    })
    it('should navigate to personal tab when link is followed', () => {
      cy.task('stubPersonal', {
        neurodivergence: [neurodivergenceAll],
      })
      cy.get('[data-test="view-neurodivergence-link"').click()
      cy.get('[data-test="neurodiversity-summary"]').then(($summary) => {
        cy.get($summary)
          .find('dt')
          .then(($summaryLabels) => {
            cy.get($summaryLabels).its('length').should('eq', 5)
            expect($summaryLabels.get(0).innerText).to.contain('Support needed')
            expect($summaryLabels.get(1).innerText).to.contain('Neurodiversity')
          })

        cy.get($summary)
          .find('dd')
          .then(($summaryValues) => {
            cy.get($summaryValues).its('length').should('eq', 5)
            expect($summaryValues.get(0).innerText).to.contain('Memory Support').and.to.contain('Reading Support')
            expect($summaryValues.get(1).innerText).to.contain('From self-assessment')
            expect($summaryValues.get(2).innerText).to.contain('ADHD').and.to.contain('Autism')
            expect($summaryValues.get(3).innerText).to.contain('From neurodiversity assessment')
            expect($summaryValues.get(4).innerText)
              .to.contain('Acquired Brain Injury')
              .and.to.contain('Recorded on 15 February 2022')
          })
      })
    })
  })
})
