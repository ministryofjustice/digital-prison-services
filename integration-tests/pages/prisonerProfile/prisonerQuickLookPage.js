const page = require('../page')

const prisonerQuickLookPage = offenderName => page(offenderName, {})

export default {
  verifyOnPage: prisonerQuickLookPage,
  goTo: offenderNo => {
    cy.visit(`/prisoner/${offenderNo}`)
    return prisonerQuickLookPage()
  },
}
