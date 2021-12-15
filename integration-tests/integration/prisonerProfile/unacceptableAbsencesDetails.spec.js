import moment from 'moment'

const agencies = [
  { agencyId: 'RNI', formattedDescription: 'Ranby (HMP)' },
  { agencyId: 'WWI', formattedDescription: 'Wandsworth (HMP)' },
]

context('Unacceptable absences details page', () => {
  const offenderNo = 'G6123VU'

  const tableData = ($cells) => ({
    eventDate: $cells[0]?.textContent,
    activityName: $cells[1]?.textContent,
    activityDescription: $cells[2]?.textContent,
    location: $cells[3]?.textContent,
    comments: $cells[4]?.textContent,
  })

  const generateHistory = (page) => {
    const data = []
    const eventDate = moment('2021-10-10')
    // eslint-disable-next-line no-plusplus
    for (let i = page * 20; i < (page + 1) * 20; i++) {
      data.push({
        eventDate: eventDate.add(1, 'days').format('YYYY-MM-DD'),
        activityName: `Program ${i + 1}`,
        activityDescription: `Activity ${i + 1}`,
        location: 'BXI',
        comments: `comment ${i + 1}`,
      })
    }
    const iStart = page * 20
    return {
      content: data,
      pageable: {
        sort: [],
        offset: iStart % 20,
        pageSize: 20,
        pageNumber: iStart / 20,
        paged: true,
        unpaged: false,
      },
      last: iStart >= 40,
      totalElements: 55,
      totalPages: 3,
      size: 20,
      number: iStart / 20,
      first: iStart < 20,
      numberOfElements: 20,
      empty: false,
    }
  }

  context('no data available', () => {
    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubAgencies', agencies)
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })
    it('should show correct content and no table', () => {
      cy.visit(`/prisoner/${offenderNo}/unacceptable-absences`)
      cy.get('h1').contains('John Smith’s unacceptable absences for the last 6')
      cy.get('[data-test="work-inside-prison-returnLink"]').should('exist')
      cy.get('[data-test="no-unacceptable-absences"]').contains('John Smith has no unacceptable')
    })
  })

  context('One event available', () => {
    const dummyWorkHistory = {
      content: [
        {
          eventDate: '2021-07-14',
          activityName: 'Name 1',
          activityDescription: 'Description 1',
          location: 'RNI',
          comments: 'Test comment 1',
        },
      ],
      pageable: {
        sort: [],
        offset: 0,
        pageSize: 20,
        pageNumber: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      numberOfElements: 1,
      empty: false,
    }
    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubAgencies', agencies)
      cy.task('stubGetUnacceptableAbsenceDetail', { offenderNo, unacceptableAbsence: dummyWorkHistory })
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    it('should show the correct content and number of results', () => {
      cy.visit(`/prisoner/${offenderNo}/unacceptable-absences`)
      cy.get('.moj-pagination__results').then((array) => {
        cy.get(array[0]).should('have.text', 'Showing 1 to 1 of 1 results')
      })
      cy.get('[data-test="work-inside-prison-returnLink"]').should('exist')
      cy.get('tbody')
        .find('tr')
        .then(($tableRows) => {
          cy.get($tableRows).its('length').should('eq', 1)
          const jobs = Array.from($tableRows).map(($row) => tableData($row.cells))

          expect(jobs[0].eventDate).to.contain('Wed 14 Jul 2021')
          expect(jobs[0].activityName).to.contain('Name 1')
          expect(jobs[0].activityDescription).to.contain('Description 1')
          expect(jobs[0].location).to.contain('Ranby (HMP)')
          expect(jobs[0].comments).to.contain('Test comment 1')
        })
    })
  })

  context('data available', () => {
    const dummyWorkHistory = {
      content: [
        {
          eventDate: '2021-07-14',
          activityName: 'Name 1',
          activityDescription: 'Description 1',
          location: 'RNI',
          comments: 'Test comment 1',
        },
        {
          eventDate: '2021-07-16',
          activityName: 'Name 2',
          activityDescription: 'Description 2',
          location: 'WWI',
          comments: 'Test comment 2',
        },
      ],
      pageable: {
        sort: [],
        offset: 0,
        pageSize: 20,
        pageNumber: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalElements: 2,
      totalPages: 1,
      size: 20,
      number: 0,
      first: true,
      numberOfElements: 2,
      empty: false,
    }

    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubAgencies', agencies)
      cy.task('stubKeyworkerMigrated')
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    it('should render the page with correct data', () => {
      cy.task('stubGetUnacceptableAbsenceDetail', { offenderNo, unacceptableAbsence: dummyWorkHistory })

      cy.visit(`/prisoner/${offenderNo}/unacceptable-absences`)
      cy.get('h1').contains('John Smith’s unacceptable absences for the last 6')
      cy.get('.moj-pagination__results').then((array) => {
        cy.get(array[0]).should('have.text', 'Showing 1 to 2 of 2 results')
      })
      cy.get('[data-test="work-inside-prison-returnLink"]').should('exist')
      cy.get('[data-test="no-unacceptable-absences"]').should('not.exist')
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].eventDate).to.contain('Wed 14 Jul 2021')
          expect(job[0].activityName).to.contain('Name 1')
          expect(job[0].activityDescription).to.contain('Description 1')
          expect(job[0].location).to.contain('Ranby (HMP)')
          expect(job[0].comments).to.contain('Test comment 1')

          expect(job[1].eventDate).to.contain('Fri 16 Jul 2021')
          expect(job[1].activityName).to.contain('Name 2')
          expect(job[1].activityDescription).to.contain('Description 2')
          expect(job[1].location).to.contain('Wandsworth (HMP)')
          expect(job[1].comments).to.contain('Test comment 2')

          cy.get($tRows).its('length').should('eq', 2)
        })
    })

    it('should render subsequent page with correct data', () => {
      cy.task('stubGetUnacceptableAbsenceDetail', { offenderNo, unacceptableAbsence: generateHistory(0) })

      cy.visit(`/prisoner/${offenderNo}/unacceptable-absences`)
      cy.get('.moj-pagination__results').then((array) => {
        cy.get(array[0]).should('have.text', 'Showing 1 to 20 of 55 results')
      })
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          cy.get($tRows).its('length').should('eq', 20)
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].activityName).to.contain('Program 1')
          expect(job[19].activityName).to.contain('Program 20')
        })

      cy.task('stubGetUnacceptableAbsenceDetail', { offenderNo, unacceptableAbsence: generateHistory(1) })
      cy.contains('Next').click()
      cy.get('.moj-pagination__results').then((array) => {
        cy.get(array[0]).should('have.text', 'Showing 21 to 40 of 55 results')
      })
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          cy.get($tRows).its('length').should('eq', 20)
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].activityName).to.contain('Program 21')
          expect(job[19].activityName).to.contain('Program 40')
        })
    })

    it('should sort manually', () => {
      cy.task('stubGetUnacceptableAbsenceDetail', { offenderNo, unacceptableAbsence: dummyWorkHistory })

      cy.visit(`/prisoner/${offenderNo}/unacceptable-absences`)
      cy.get('[data-test="activity-header"]').children().click()
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].activityName).to.contain('Name 1')
          expect(job[1].activityName).to.contain('Name 2')
        })
      cy.get('[data-test="activity-header"]').children().click()
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].activityName).to.contain('Name 2')
          expect(job[1].activityName).to.contain('Name 1')
        })
      cy.get('[data-test="date-header"]').children().click()
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const job = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(job[0].activityName).to.contain('Name 1')
          expect(job[1].activityName).to.contain('Name 2')
        })
    })
  })
})
