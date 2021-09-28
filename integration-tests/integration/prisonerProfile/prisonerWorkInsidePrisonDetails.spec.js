context('Work inside prison details page', () => {
  const offenderNo = 'G6123VU'

  const tableData = ($cells) => ({
    role: $cells[0]?.textContent,
    location: $cells[1]?.textContent,
    startDate: $cells[2]?.textContent,
    endDate: $cells[3]?.textContent,
  })

  context('no course data available', () => {
    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })
    it('should show correct content and no table', () => {
      cy.visit(`/prisoner/${offenderNo}/work-activities`)
      cy.get('h1').should('have.text', 'John Smith’s work inside prison for the last 12 months')
      cy.get('[data-test="no-work-inside-prison"]').should('exist')
      cy.get('[data-test="work-inside-prison-returnLink"]').should('exist')
      cy.get('[data-test="no-work-inside-prison"]').should(
        'have.text',
        'John Smith has no work inside prison for the last 12 months.'
      )
    })
  })
  context('One job available', () => {
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
      ],
    }
    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubOffenderWorkHistory', dummyWorkHistory)
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    it('should show the correct content and number of results', () => {
      cy.visit(`/prisoner/${offenderNo}/work-activities`)
      cy.get('h1').should('have.text', 'John Smith’s work inside prison for the last 12 months')
      cy.get('[data-test="workInsidePrison-result-number"]').should('have.text', 'Showing 1 result')
      cy.get('[data-test="work-inside-prison-returnLink"]').should('exist')
      cy.get('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 1)
          const jobs = Array.from($tableRows).map(($row) => tableData($row.cells))

          expect(jobs[0].role).to.contain('Cleaner HB1 AM')
          expect(jobs[0].location).to.contain('Moorland (HMP & YOI)')
          expect(jobs[0].startDate).to.contain('19/08/2021')
          expect(jobs[0].endDate).to.contain('Ongoing')
        })
    })
  })
  context('data available', () => {
    const dummyWorkHistory = {
      offenderNo: 'G6123VU',
      workActivities: [
        {
          bookingId: 1102484,
          agencyLocationId: 'MDI',
          agencyLocationDescription: 'Moorland (HMP & YOI)',
          description: 'Cleaner BB1 AM',
          startDate: '2021-08-19',
          isCurrentActivity: true,
        },
        {
          bookingId: 1102484,
          agencyLocationId: 'MDI',
          agencyLocationDescription: 'Moorland (HMP & YOI)',
          description: 'Cleaner HB1 PM',
          startDate: '2020-07-20',
          endDate: '2021-05-11',
          isCurrentActivity: false,
        },
        {
          bookingId: 1102484,
          agencyLocationId: 'MDI',
          agencyLocationDescription: 'Moorland (HMP & YOI)',
          description: 'Library PR1 PM',
          startDate: '2020-01-20',
          endDate: '2021-09-01',
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
      ],
    }

    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubOffenderWorkHistory', dummyWorkHistory)
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    it('should render the page with correct data', () => {
      cy.visit(`/prisoner/${offenderNo}/work-activities`)
      cy.get('h1').should('have.text', 'John Smith’s work inside prison for the last 12 months')
      cy.get('[data-test="workInsidePrison-result-number"]').should('have.text', 'Showing 4 results')
      cy.get('[data-test="work-inside-prison-returnLink"]').should('exist')
      cy.get('[data-test="no-work-inside-prison"]').should('not.exist')
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          cy.get($tRows).its('length').should('eq', 4)
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].role).to.contain('Cleaner BB1 AM')
          expect(job[0].location).to.contain('Moorland (HMP & YOI)')
          expect(job[0].startDate).to.contain('19/08/2021')
          expect(job[0].endDate).to.contain('Ongoing')

          expect(job[1].role).to.contain('Library PR1 PM')
          expect(job[1].location).to.contain('Moorland (HMP & YOI)')
          expect(job[1].startDate).to.contain('20/01/2020')
          expect(job[1].endDate).to.contain('01/09/2021')

          expect(job[2].role).to.contain('Cleaner HB1 AM')
          expect(job[2].location).to.contain('Moorland (HMP & YOI)')
          expect(job[2].startDate).to.contain('20/07/2021')
          expect(job[2].endDate).to.contain('23/07/2021')

          expect(job[3].role).to.contain('Cleaner HB1 PM')
          expect(job[3].location).to.contain('Moorland (HMP & YOI)')
          expect(job[3].startDate).to.contain('20/07/2020')
          expect(job[3].endDate).to.contain('11/05/2021')
        })
    })

    it('should sort manually', () => {
      cy.visit(`/prisoner/${offenderNo}/work-activities`)
      cy.get('[data-test="workInsidePrison-start-date-header"]').children().click()
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].role).to.contain('Library PR1 PM')
          expect(job[0].location).to.contain('Moorland (HMP & YOI)')
          expect(job[0].startDate).to.contain('20/01/2020')
          expect(job[0].endDate).to.contain('01/09/2021')

          expect(job[1].role).to.contain('Cleaner HB1 PM')
          expect(job[1].location).to.contain('Moorland (HMP & YOI)')
          expect(job[1].startDate).to.contain('20/07/2020')
          expect(job[1].endDate).to.contain('11/05/2021')

          expect(job[2].role).to.contain('Cleaner HB1 AM')
          expect(job[2].location).to.contain('Moorland (HMP & YOI)')
          expect(job[2].startDate).to.contain('20/07/2021')
          expect(job[2].endDate).to.contain('23/07/2021')

          expect(job[3].role).to.contain('Cleaner BB1 AM')
          expect(job[3].location).to.contain('Moorland (HMP & YOI)')
          expect(job[3].startDate).to.contain('19/08/2021')
          expect(job[3].endDate).to.contain('Ongoing')
        })
      cy.get('[data-test="workInsidePrison-start-date-header"]').children().click()
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].role).to.contain('Cleaner BB1 AM')
          expect(job[0].location).to.contain('Moorland (HMP & YOI)')
          expect(job[0].startDate).to.contain('19/08/2021')
          expect(job[0].endDate).to.contain('Ongoing')

          expect(job[1].role).to.contain('Cleaner HB1 AM')
          expect(job[1].location).to.contain('Moorland (HMP & YOI)')
          expect(job[1].startDate).to.contain('20/07/2021')
          expect(job[1].endDate).to.contain('23/07/2021')

          expect(job[2].role).to.contain('Cleaner HB1 PM')
          expect(job[2].location).to.contain('Moorland (HMP & YOI)')
          expect(job[2].startDate).to.contain('20/07/2020')
          expect(job[2].endDate).to.contain('11/05/2021')

          expect(job[3].role).to.contain('Library PR1 PM')
          expect(job[3].location).to.contain('Moorland (HMP & YOI)')
          expect(job[3].startDate).to.contain('20/01/2020')
          expect(job[3].endDate).to.contain('01/09/2021')
        })
      cy.get('[data-test="workInsidePrison-end-date-header"]').children().click()
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].role).to.contain('Cleaner HB1 PM')
          expect(job[0].location).to.contain('Moorland (HMP & YOI)')
          expect(job[0].startDate).to.contain('20/07/2020')
          expect(job[0].endDate).to.contain('11/05/2021')

          expect(job[1].role).to.contain('Cleaner HB1 AM')
          expect(job[1].location).to.contain('Moorland (HMP & YOI)')
          expect(job[1].startDate).to.contain('20/07/2021')
          expect(job[1].endDate).to.contain('23/07/2021')

          expect(job[2].role).to.contain('Library PR1 PM')
          expect(job[2].location).to.contain('Moorland (HMP & YOI)')
          expect(job[2].startDate).to.contain('20/01/2020')
          expect(job[2].endDate).to.contain('01/09/2021')

          expect(job[3].role).to.contain('Cleaner BB1 AM')
          expect(job[3].location).to.contain('Moorland (HMP & YOI)')
          expect(job[3].startDate).to.contain('19/08/2021')
          expect(job[3].endDate).to.contain('Ongoing')
        })
    })
  })
})
