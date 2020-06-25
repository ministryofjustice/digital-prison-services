const moment = require('moment')
const page = require('../page')

const addBulkAppointmentsAppointmentPage = () =>
  page('Add appointment details', {
    form: () => ({
      appointmentType: () => cy.get('#appointment-type'),
      location: () => cy.get('#location'),
      date: () => cy.get('#date'),
      startTimeHours: () => cy.get('#start-time-hours'),
      startTimeMinutes: () => cy.get('#start-time-minutes'),
      endTimeHours: () => cy.get('#end-time-hours'),
      endTimeMinutes: () => cy.get('#end-time-minutes'),
      sameTimeAppointmentsYes: () => cy.get('#same-time-appointments'),
      sameTimeAppointmentsNo: () => cy.get('#same-time-appointments-2'),
      recurringYes: () => cy.get('#recurring'),
      recurringNo: () => cy.get('#recurring-2'),
      repeats: () => cy.get('#repeats'),
      times: () => cy.get('#times'),
      comments: () => cy.get('#comments'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
    datePicker: () => cy.get('#ui-datepicker-div'),
    recurringInputs: () => cy.get('[data-qa="recurring-inputs"]'),
    offenderEvents: () => cy.get('[data-qa="offender-events"]'),
    locationEvents: () => cy.get('[data-qa="location-events"]'),
    errorSummary: () => cy.get('.govuk-error-summary'),
    lastAppointmentDate: () => cy.get('.js-appointment-last-appointment'),
    enterBasicAppointmentDetails: form => {
      form.appointmentType().select('ACTI')
      form.location().select('1')
      form.date().type(
        moment()
          .add(10, 'days')
          .format('DD/MM/YYYY')
      )
      cy.get('.ui-state-active').click()
    },
  })

export default {
  verifyOnPage: addBulkAppointmentsAppointmentPage,
  goTo: () => {
    cy.visit('/bulk-appointments/add-appointment-details')
    return addBulkAppointmentsAppointmentPage()
  },
}
