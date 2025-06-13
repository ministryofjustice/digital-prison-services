const page = require('../page')

const bulkAppointmentsUploadCSVPage = () =>
  page('Upload a CSV File', {
    form: () => ({
      file: () => cy.get('#file'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
  })

export default {
  verifyOnPage: bulkAppointmentsUploadCSVPage,
  goTo: () => {
    cy.visit('/bulk-appointments/upload-file')
    return bulkAppointmentsUploadCSVPage()
  },
  verifyFileTooLargeErrorOnPage: () => {
    cy.get('#file-error') // Select by ID (not attribute)
      .should('be.visible') // Ensure it's shown
      .and('contain.text', 'The selected file must be smaller than 100kb')
  },
}
