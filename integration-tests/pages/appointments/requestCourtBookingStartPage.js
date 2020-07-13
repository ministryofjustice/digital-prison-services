const page = require('../page')

const requestCourtBookingStartPage = () =>
  page('Request video link date and time', {
    form: () => ({
      prison: () => cy.get('#prison'),
      date: () => cy.get('#date'),
      startTimeHours: () => cy.get('#start-time-hours'),
      startTimeMinutes: () => cy.get('#start-time-minutes'),
      endTimeHours: () => cy.get('#end-time-hours'),
      endTimeMinutes: () => cy.get('#end-time-minutes'),
      preAppointmentYes: () => cy.get('#pre-appointment-required'),
      preAppointmentNo: () => cy.get('#pre-appointment-required-2'),
      postAppointmentYes: () => cy.get('#post-appointment-required'),
      postAppointmentNo: () => cy.get('#post-appointment-required-2'),
      submitButton: () => cy.get('button[type="submit"]'),
    }),
  })

export default {
  verifyOnPage: requestCourtBookingStartPage,
  goTo: () => {
    cy.visit('/request-booking')
    return requestCourtBookingStartPage()
  },
}
