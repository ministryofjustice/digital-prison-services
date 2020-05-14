Cypress.Commands.add('login', () => {
  cy.request('/videolink')
  cy.task('getLoginUrl').then(cy.visit)
})
