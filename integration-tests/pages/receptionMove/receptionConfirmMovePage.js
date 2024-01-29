const page = require('../page')

const receptionConfirmMovePage = () =>
  page('You are moving John Smith to reception', {
    govInsetTextMessage: () => cy.get('.govuk-inset-text'),
    form: () => ({
      submitButton: () => cy.get('button[type="submit"]'),
      selectReceptionReason: () => cy.get('#reason-4'),
      moveReason: () => cy.get('#comment'),
    }),
    backLink: () =>
      cy
        .get('.govuk-back-link')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('http://localhost:3008/prisoner/G3878UK/reception-move/confirm-reception-move')
        }),
    cancelLink: () =>
      cy
        .get('[data-test="cancel-link"]')
        .invoke('attr', 'href')
        .then((href) => {
          expect(href).to.equal('/prisoners/G3878UK/cell-history')
        }),
  })

export default {
  verifyOnPage: receptionConfirmMovePage,
  goTo: (offenderNo) => {
    cy.visit(`/prisoner/${offenderNo}/reception-move/confirm-reception-move`, { failOnStatusCode: false })
    return receptionConfirmMovePage()
  },
}
