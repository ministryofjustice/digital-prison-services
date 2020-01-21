package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ConfirmRecurringAppointmentPage extends Page {
    static url = "/offenders/A12345/confirm-appointment"

    static content = {
        pageTitle { $('h1').text() }
    }

    static at = {
        pageTitle.contains("Appointments booked")
    }

}
