const moment = require('moment')
const offenderBasicDetails = require('../../mockApis/responses/offenderBasicDetails.json')
const offenderFullDetails = require('../../mockApis/responses/offenderFullDetails.json')
const { quickLookFullDetails } = require('../prisonerProfile/prisonerQuickLook.cy')

context('Prisoner search', () => {
  const inmate1Iep = {
    bookingId: 1,
    iepLevel: 'Standard',
  }
  const inmate2Iep = {
    bookingId: 2,
    iepLevel: 'Standard',
  }

  before(() => {
    cy.clearCookies()
    cy.task('resetAndStubTokenVerification')
    cy.task('stubSignIn', {
      username: 'ITAG_USER',
      caseload: 'MDI',
      caseloads: [
        {
          caseLoadId: 'MDI',
          description: 'Moorland',
          currentlyActive: true,
        },
        {
          caseLoadId: 'WWI',
          description: 'Wandsworth',
          currentlyActive: false,
        },
      ],
    })
    cy.signIn()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('hmpps-session-dev')
  })

  context('Search using prison-api', () => {
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
  })

  context('Search using search api', () => {
    const inmate1 = {
      bookingId: '1',
      prisonerNumber: 'A1234BC',
      firstName: 'JOHN',
      lastName: 'SAUNDERS',
      dateOfBirth: moment().subtract(29, 'years'),
      prisonId: 'MDI',
      cellLocation: 'UNIT-1',
      category: 'A',
      alerts: [{ alertCode: 'XA' }, { alertCode: 'XVL' }],
    }

    const inmate2 = {
      bookingId: '2',
      prisonerNumber: 'B4567CD',
      firstName: 'STEVE',
      lastName: 'SMITH',
      dateOfBirth: moment().subtract(30, 'years'),
      prisonId: 'MDI',
      cellLocation: 'UNIT-2',
      category: 'C',
      alerts: [{ alertCode: 'RSS' }, { alertCode: 'XC' }],
    }

    context('When there are no search values', () => {
      beforeEach(() => {
        cy.task('stubUserLocations')
      })

      it('should display correct prisoner information', () => {
        cy.task('stubPSInmates', {
          locationId: 'MDI',
          count: 2,
          data: [inmate1, inmate2],
        })
        cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
        cy.visit(`/prisoner-search?feature=new`)

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
      it('can search for prisoners when in caseload that is not active', () => {
        cy.task('stubPSInmates', {
          locationId: 'WWI',
          count: 2,
          data: [inmate1, inmate2],
        })
        cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
        cy.visit(`/prisoner-search?location=WWI&feature=new`)

        cy.get('[data-test="prisoner-search-results-table"]').then(($table) => {
          cy.get($table)
            .find('tr')
            .then(($tableRows) => {
              cy.get($tableRows).its('length').should('eq', 3) // 2 results plus table header
            })
        })
      })
      it('will silently not find any prisoners when prison is not in any caseload assighned to user', () => {
        // stubbed - but actually it will never be clalled
        cy.task('stubPSInmates', {
          locationId: 'BXI',
          count: 2,
          data: [inmate1, inmate2],
        })
        cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
        cy.visit(`/prisoner-search?location=BXI&feature=new`)

        cy.contains('No records found matching search criteria')
      })
    })

    context('When there are search values', () => {
      beforeEach(() => {
        cy.task('stubUserLocations')
      })

      it('should have correct data pre filled from search query', () => {
        cy.task('stubPSInmates', {
          locationId: 'MDI',
          count: 1,
          data: [inmate1],
        })
        cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep])
        cy.visit(`/prisoner-search?keywords=Saunders&location=MDI&alerts%5B%5D=XA&feature=new`)

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
        cy.task('stubPSInmates', {
          locationId: 'MDI',
          count: 1,
          data: [inmate1],
        })
        cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep])
        cy.visit(`/prisoner-search?keywords=Saunders&location=MDI&alerts%5B%5D=XA&feature=new`)

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
        cy.task('stubPSInmates', {
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
        cy.task('stubPSInmates', {
          locationId: 'MDI',
          count: 2,
          data: [inmate1, inmate2],
        })
        cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
        cy.visit(`/prisoner-search?pageLimitOption=1&feature=new`)

        cy.get('[data-test="prisoner-search-view-all-link"]').then(($link) => {
          cy.get($link).should('contain.text', 'View all results').click()
          cy.get($link).should('not.exist')
        })
      })

      it('should show correct order options for grid view', () => {
        cy.task('stubPSInmates', {
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
        cy.task('stubPSInmates', {
          locationId: 'MDI',
          count: 2,
          data: [inmate1, inmate2],
        })
        cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
        cy.visit(`/prisoner-search?view=grid&feature=new`)

        cy.get('[data-test="prisoner-profile-link"]').then(($prisonerProfileLinks) => {
          cy.get($prisonerProfileLinks).its('length').should('eq', 2)
          cy.get($prisonerProfileLinks.get(0)).should('have.attr', 'href').should('include', '/prisoner/A1234BC')
          cy.get($prisonerProfileLinks.get(1)).should('have.attr', 'href').should('include', '/prisoner/B4567CD')
        })
      })

      it('should maintain search options when sorting', () => {
        cy.task('stubPSInmates', {
          locationId: 'MDI',
          count: 2,
          data: [inmate1, inmate2],
        })
        cy.task('stubGetIepSummaryForBookingIds', [inmate1Iep, inmate2Iep])
        cy.visit(`/prisoner-search?keywords=Saunders&location=MDI&alerts%5B%5D=XA&feature=new`)

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
            '?keywords=Saunders&location=MDI&feature=new&alerts%5B%5D=XA&sortFieldsWithOrder=assignedLivingUnitDesc%3AASC'
          )
        })
      })

      it('should show the correct most recent search link when visiting a profile page from search', () => {
        const searchUrl = '/prisoner-search?keywords=Saunders&location=MDI&alerts%5B%5D=XA&feature=new'

        cy.task('stubPSInmates', {
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

        cy.get('[data-test="back-link"]').should('have.attr', 'href', searchUrl)
      })
    })
  })
})
