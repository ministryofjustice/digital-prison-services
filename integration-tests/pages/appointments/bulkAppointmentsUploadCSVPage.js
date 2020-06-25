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
}
