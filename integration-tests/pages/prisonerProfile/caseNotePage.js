const page = require('../page')

const row = i => cy.get(`tbody tr`).eq(i)

const column = (i, j) =>
  row(i)
    .find('td')
    .eq(j)

const caseNotePage = () =>
  page('Prisoners case notes', {
    getCaseNotes: i => ({
      createdBy: () => column(i, 0),
      caseNoteDetails: () => column(i, 1),
    }),
  })

export default {
  verifyOnPage: caseNotePage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}/case-notes`)
    return caseNotePage()
  },
}
