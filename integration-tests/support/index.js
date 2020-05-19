import './commands'

// There seem to be some uncaught exceptions in Gov UK
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})
