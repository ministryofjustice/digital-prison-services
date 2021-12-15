import moment from 'moment'

context('Prisoner courses and qualifications details page', () => {
  const offenderNo = 'G6123VU'

  const generateHistory = (page) => {
    const data = []
    const endDate = moment('2021-08-10')
    // eslint-disable-next-line no-plusplus
    for (let i = page * 20; i < (page + 1) * 20; i++) {
      data.push({
        prn: 'G6123VU',
        establishmentName: 'MOORLAND (HMP & YOI)',
        courseName: `Course ${i + 1}`,
        isAccredited: false,
        learningStartDate: '2021-02-13',
        learningPlannedEndDate: endDate.add(1, 'days').format('YYYY-MM-DD'),
        learningActualEndDate: null,
        outcome: null,
        outcomeGrade: null,
        withdrawalReasons: null,
        prisonWithdrawalReason: null,
        completionStatus:
          'The learner is continuing or intending to continue the learning activities leading to the learning aim',
        withdrawalReasonAgreed: false,
      })
    }
    const iStart = page * 20
    return {
      content: data,
      pageable: {
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
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
      sort: {
        empty: true,
        sorted: false,
        unsorted: true,
      },
      first: iStart < 20,
      numberOfElements: 20,
      empty: false,
    }
  }

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
      cy.visit(`/prisoner/${offenderNo}/courses-qualifications`)
      cy.get('h1').should('have.text', 'John Smith’s courses and qualifications')
      cy.get('[data-test="no-courses-qualifications"]').should('exist')
      cy.get('[data-test="courses-qualifications-returnLink"]').should('exist')
      cy.get('[data-test="no-courses-qualifications"]').should(
        'have.text',
        'John Smith has no courses or qualifications'
      )
    })
  })

  context('One piece of data available', () => {
    const dummyEducation = {
      content: [
        {
          prn: 'G6123VU',
          establishmentName: 'MOORLAND (HMP & YOI)',
          courseName: 'Ocean Science',
          isAccredited: false,
          learningStartDate: '2021-02-13',
          learningPlannedEndDate: '2021-06-08',
          learningActualEndDate: null,
          outcome: null,
          outcomeGrade: null,
          withdrawalReasons: null,
          prisonWithdrawalReason: null,
          completionStatus:
            'The learner is continuing or intending to continue the learning activities leading to the learning aim',
          withdrawalReasonAgreed: false,
        },
      ],
      pageable: {
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
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
      sort: {
        empty: true,
        sorted: false,
        unsorted: true,
      },
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
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    it('should show the correct content and number of results', () => {
      cy.task('stubLearnerEducation', dummyEducation)

      cy.visit(`/prisoner/${offenderNo}/courses-qualifications`)
      cy.get('h1').should('have.text', 'John Smith’s courses and qualifications')
      cy.get('.moj-pagination__results').then((array) => {
        cy.get(array[0]).should('have.text', 'Showing 1 to 1 of 1 results')
      })
      cy.get('[data-test="courses-qualifications-returnLink"]').should('exist')
      cy.get('tbody tr')
        .find('td')
        .then(($cells) => {
          expect($cells.length).to.eq(6)
          expect($cells.get(0).innerText).to.contain('Non-accredited')
          expect($cells.get(1).innerText).to.contain('Ocean Science')
          expect($cells.get(2).innerText).to.contain('Moorland (HMP & YOI)')
          expect($cells.get(3).innerText).to.contain('13/02/2021\nto 08/06/2021')
          expect($cells.get(4).innerText).to.contain('In progress')
          expect($cells.get(5).innerText).to.contain('')
        })
    })
  })
  context('data available', () => {
    const dummyEducation = {
      content: [
        {
          prn: 'G6123VU',
          establishmentName: 'MOORLAND (HMP & YOI)',
          courseName: 'Ocean Science',
          isAccredited: false,
          learningStartDate: '2021-05-13',
          learningPlannedEndDate: '2021-08-08',
          learningActualEndDate: null,
          outcome: null,
          outcomeGrade: null,
          withdrawalReasons: null,
          prisonWithdrawalReason: null,
          completionStatus:
            'The learner is continuing or intending to continue the learning activities leading to the learning aim',
          withdrawalReasonAgreed: false,
        },
        {
          prn: 'A1234AA',
          establishmentName: 'MOORLAND (HMP & YOI)',
          courseName: 'Foundation Degree in Arts in Equestrian Practice and Technology',
          isAccredited: true,
          learningStartDate: '2021-07-19',
          learningPlannedEndDate: '2022-06-16',
          learningActualEndDate: '2021-07-21',
          outcome: 'No achievement',
          outcomeGrade: 'Fail',
          withdrawalReasons: null,
          prisonWithdrawalReason: null,
          completionStatus: 'The learner has completed the learning activities leading to the learning aim',
          withdrawalReasonAgreed: false,
        },
        {
          prn: 'A1234AA',
          establishmentName: 'MOORLAND (HMP & YOI)',
          courseName: 'Certificate of Management',
          isAccredited: true,
          learningStartDate: '2021-07-01',
          learningPlannedEndDate: '2021-07-31',
          learningActualEndDate: '2021-07-08',
          outcome: 'Achieved',
          outcomeGrade: null,
          withdrawalReasons: 'Other',
          prisonWithdrawalReason: 'Changes in their risk profile meaning they can no longer take part in the learning',
          completionStatus: 'The learner has withdrawn from the learning activities leading to the learning aim',
          withdrawalReasonAgreed: true,
        },
        {
          prn: 'A1234AA',
          establishmentName: 'MOORLAND (HMP & YOI)',
          courseName: 'Certificate of Help',
          isAccredited: true,
          learningStartDate: '2021-07-01',
          learningPlannedEndDate: '2021-07-31',
          learningActualEndDate: '2021-07-08',
          outcome: 'Achieved',
          outcomeGrade: null,
          withdrawalReasons: 'Other',
          prisonWithdrawalReason: 'Significant ill health causing them to be unable to attend education',
          completionStatus: 'Learner has temporarily withdrawn from the aim due to an agreed break in learning',
          withdrawalReasonAgreed: true,
        },
      ],
      pageable: {
        sort: {
          empty: true,
          sorted: false,
          unsorted: true,
        },
        offset: 0,
        pageSize: 20,
        pageNumber: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalElements: 4,
      totalPages: 1,
      size: 20,
      number: 0,
      sort: {
        empty: true,
        sorted: false,
        unsorted: true,
      },
      first: true,
      numberOfElements: 4,
      empty: false,
    }

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

    it('should render the page with correct data', () => {
      cy.task('stubLearnerEducation', dummyEducation)

      cy.visit(`/prisoner/${offenderNo}/courses-qualifications`)
      cy.get('h1').should('have.text', 'John Smith’s courses and qualifications')
      cy.get('.moj-pagination__results').then((array) => {
        cy.get(array[0]).should('have.text', 'Showing 1 to 4 of 4 results')
      })
      cy.get('[data-test="no-courses-qualifications"]').should('not.exist')
      cy.get('[data-test="courses-qualifications-returnLink"]').should('exist')
      cy.get('thead')
        .find('th')
        .then(($columnHeader) => {
          expect($columnHeader.get(0).innerText).to.contain('Type')
          expect($columnHeader.get(1).innerText).to.contain('Course name')
          expect($columnHeader.get(2).innerText).to.contain('Location')
          expect($columnHeader.get(3).innerText).to.contain('Dates')
          expect($columnHeader.get(4).innerText).to.contain('Outcome')
          expect($columnHeader.get(5).innerText).to.contain('Outcome details')
        })
      cy.get('tbody tr')
        .find('td')
        .then(($cells) => {
          expect($cells.length).to.eq(24)
          expect($cells.get(0).innerText).to.contain('Non-accredited')
          expect($cells.get(1).innerText).to.contain('Ocean Science')
          expect($cells.get(3).innerText).to.contain('13/05/2021\nto 08/08/2021')
          expect($cells.get(4).innerText).to.contain('In progress')
          expect($cells.get(5).innerText).to.contain('')
          expect($cells.get(7).innerText).to.contain('Foundation Degree in Arts in Equestrian Practice and Technology')
          expect($cells.get(9).innerText).to.contain('19/07/2021\nto 21/07/2021')
          expect($cells.get(10).innerText).to.contain('Fail')
          expect($cells.get(11).innerText).to.contain('No achievement')
          expect($cells.get(13).innerText).to.contain('Certificate of Management')
          expect($cells.get(15).innerText).to.contain('01/07/2021\nto 08/07/2021')
          expect($cells.get(22).innerText).to.contain('Temporarily withdrawn')
          expect($cells.get(23).innerText).to.contain(
            'Significant ill health causing them to be unable to attend education'
          )
        })
    })

    it('should render subsequent page with correct data', () => {
      cy.task('stubLearnerEducation', generateHistory(0))

      cy.visit(`/prisoner/${offenderNo}/courses-qualifications`)
      cy.get('h1').should('have.text', 'John Smith’s courses and qualifications')
      cy.get('.moj-pagination__results').then((array) => {
        cy.get(array[0]).should('have.text', 'Showing 1 to 20 of 55 results')
      })
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          cy.get($tRows).its('length').should('eq', 20)
          const row = Array.from($tRows).map(($row) => $row.cells['1'])

          expect(row[0].textContent).to.contain('Course 20') // sorted by descending end date
          expect(row[19].textContent).to.contain('Course 1')
        })

      cy.task('stubLearnerEducation', generateHistory(1))
      cy.contains('Next').click()
      cy.get('.moj-pagination__results').then((array) => {
        cy.get(array[0]).should('have.text', 'Showing 21 to 40 of 55 results')
      })
      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          cy.get($tRows).its('length').should('eq', 20)
          const row = Array.from($tRows).map(($row) => $row.cells['1'])

          expect(row[0].textContent).to.contain('Course 40')
          expect(row[19].textContent).to.contain('Course 21')
        })
    })
  })
})
