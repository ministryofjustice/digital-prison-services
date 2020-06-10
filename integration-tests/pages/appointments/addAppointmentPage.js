const page = require('../page')

const addAppointmentPage = () =>
  page('Add new appointment', {
    form: () => ({
      appointmentType: () => cy.get('#appointment-type'),
      location: () => cy.get('#location'),
      date: () => cy.get('#date'),
      startTimeHours: () => cy.get('#start-time-hours'),
      startTimeMinutes: () => cy.get('#start-time-minutes'),
      endTimeHours: () => cy.get('#end-time-hours'),
      endTimeMinutes: () => cy.get('#end-time-minutes'),
      recurringYes: () => cy.get('#recurring'),
      recurringNo: () => cy.get('#recurring-2'),
      repeats: () => cy.get('#repeats'),
      times: () => cy.get('#times'),
      comments: () => cy.get('#comments'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    datePicker: () => cy.get('#ui-datepicker-div'),
    activeDate: () => cy.get('.ui-state-active'),
    recurringInputs: () => cy.get('[data-qa="recurring-inputs"]'),
    offenderEvents: () => cy.get('[data-qa="offender-events"]'),
    locationEvents: () => cy.get('[data-qa="location-events"]'),
    errorSummary: () => cy.get('.govuk-error-summary'),
  })

export default {
  verifyOnPage: addAppointmentPage,
  goTo: offenderNo => {
    cy.visit(`/offenders/${offenderNo}/add-appointment`)
    return addAppointmentPage()
  },
}
