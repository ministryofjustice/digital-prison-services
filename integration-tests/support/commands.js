import 'cypress-file-upload'

Cypress.Commands.add('login', (url = '/') => {
  cy.request(url)
  cy.task('getLoginUrl').then(cy.visit)
})
