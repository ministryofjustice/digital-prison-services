import 'cypress-file-upload'

Cypress.Commands.add('signIn', (url = '/') => {
  cy.request(url)
  cy.task('getSignInUrl').then(cy.visit)
})
