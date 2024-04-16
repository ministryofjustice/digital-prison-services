import 'cypress-file-upload'

Cypress.Commands.add('signIn', (url = '/') => {
  cy.task('stubDpsHomepage')
  cy.request(url)
  cy.task('getSignInUrl').then(cy.visit)
})
