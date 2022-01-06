import moment from 'moment'

context('Employability skills details page', () => {
  const offenderNo = 'G6123VU'

  const tableData = ($cells) => ({
    level: $cells[0]?.textContent,
    date: $cells[1]?.textContent,
    comment: $cells[2]?.textContent,
  })

  function generate(number) {
    const data = []
    const date = moment('2021-10-10')
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < number; i++) {
      data.push({
        currentProgression: `Level ${i}`,
        reviewDate: date.add(1, 'days').format('YYYY-MM-DD'),
        comment: `Comment ${i}`,
      })
    }
    return data
  }

  context('data available', () => {
    const review1 = {
      reviewDate: '2021-05-28',
      currentProgression: '3 - Acceptable demonstration',
      comment: 'test 1',
    }
    const review2 = {
      reviewDate: '2021-06-29',
      currentProgression: '2 - Minimal demonstration',
      comment: 'test 2',
    }
    const review3 = {
      reviewDate: '2021-04-30',
      currentProgression: '1 - No demonstration',
      comment: 'test 3',
    }
    const employabilitySkillsData = {
      content: [
        {
          employabilitySkill: 'Problem Solving',
          reviews: [review1],
        },
        {
          employabilitySkill: 'Adaptability',
          reviews: [review2, review3],
        },
        {
          employabilitySkill: 'Problem Solving',
          reviews: generate(29),
        },
      ],
    }

    before(() => {
      cy.clearCookies()
      cy.task('reset')
      cy.task('stubSignIn', { username: 'ITAG_USER', caseload: 'MDI' })
      cy.signIn()
      cy.task('stubOffenderBasicDetails', { bookingId: 1, firstName: 'John', lastName: 'Smith', agencyId: 'MDI' })
      cy.task('stubKeyworkerMigrated')
    })

    beforeEach(() => {
      Cypress.Cookies.preserveOnce('hmpps-session-dev')
    })

    it('should render the page with correct data and behaviour', () => {
      cy.task('stubLearnerEmployabilitySkills', employabilitySkillsData)

      cy.visit(`/prisoner/${offenderNo}/skills?skill=Problem Solving`)
      cy.get('h1').contains("John Smith’s assessments for 'problem solving'")
      cy.get('.moj-pagination__results').contains('Showing 1 to 20 of 30 results')

      cy.get('[data-test="no-employability-skills"]').should('not.exist')
      cy.get('[data-test="employability-skills-returnLink"]').should('be.visible')

      cy.get('ul.moj-side-navigation__list a').eq(0).contains('Adaptability (2)')
      cy.get('ul.moj-side-navigation__list a').eq(1).contains('Communication (0)')
      cy.get('ul.moj-side-navigation__list a').eq(6).contains('Problem solving (30)')

      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const review = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(review[0].level).to.contain('Level 28')
          expect(review[0].date).to.contain('08/11/2021')
          expect(review[0].comment).to.contain('Comment 28')
          expect(review[19].level).to.contain('Level 9')
          expect(review[19].date).to.contain('20/10/2021')
          expect(review[19].comment).to.contain('Comment 9')

          cy.get($tRows).its('length').should('eq', 20)
        })

      cy.get('th[data-test="date-header"]').click() // reverse order

      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const review = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(review[0].level).to.contain('Level 9')
          expect(review[19].level).to.contain('Level 28')
        })

      cy.contains('Next').click()
      cy.get('.moj-pagination__results').contains('Showing 21 to 30 of 30 results')

      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const review = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(review[0].level).to.contain('Level 8')
          expect(review[0].date).to.contain('19/10/2021')
          expect(review[0].comment).to.contain('Comment 8')

          expect(review[9].level).to.contain('3 - Acceptable demonstration')
          expect(review[9].date).to.contain('28/05/2021')
          expect(review[9].comment).to.contain('test 1')

          cy.get($tRows).its('length').should('eq', 10)
        })

      cy.contains('Adaptability (2)').click()
      cy.get('.moj-pagination__results').contains('Showing 1 to 2 of 2 results')
      cy.contains('John Smith has no assessments for this employability skill').should('not.exist')
      cy.contains("What does the skill 'adaptability' include?").should('not.exist')
      cy.contains("'Adaptability' includes:")
      cy.get('ul.govuk-list--bullet > li').should('be.visible')
      cy.get('ul.govuk-list--bullet > li').contains('acknowledging and accepting change')

      cy.get('tbody')
        .find('tr')
        .then(($tRows) => {
          const review = Array.from($tRows).map(($row) => tableData($row.cells))

          expect(review[0].level).to.contain('2 - Minimal demonstration')
          expect(review[0].date).to.contain('29/06/2021')
          expect(review[0].comment).to.contain('test 2')

          expect(review[1].level).to.contain('1 - No demonstration')
          expect(review[1].date).to.contain('30/04/2021')
          expect(review[1].comment).to.contain('test 3')

          cy.get($tRows).its('length').should('eq', 2)
        })

      cy.contains('Initiative (0)').click()
      cy.contains('John Smith has no assessments for this employability skill')
      cy.contains("What does the skill 'initiative' include?").click()
      cy.get('ul.govuk-list--bullet > li').should('be.visible')
      cy.get('ul.govuk-list--bullet > li').contains('doing something independently without being told')
    })
  })
})
