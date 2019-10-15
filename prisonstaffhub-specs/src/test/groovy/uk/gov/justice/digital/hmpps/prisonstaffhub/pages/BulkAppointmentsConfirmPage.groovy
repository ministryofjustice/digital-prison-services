package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class BulkAppointmentsConfirmPage extends Page {
    static url = "/bulk-appointments/confirm-appointments"

    static content = {
        pageTitle { $('h1').first().text() }
        appointmentType {$('[data-qa="appointment-details-summary-appointment-type"]') }
        appointmentLocation {$('[data-qa="appointment-details-summary-appointment-location"]') }
        appointmentStartDate {$('[data-qa="appointment-details-summary-appointment-start-date"]') }
        appointmentStartTime {$('[data-qa="appointment-details-summary-appointment-start-time"]') }
        prisonersNotFound {$('[data-qa="prisoners-not-found"]') }
        prisonersFound {$('[data-qa="prisoners-found"]') }
        submitButton { $('button', type: 'submit') }
    }

    static at = {
        pageTitle == "Confirm appointments"
        submitButton.text() == 'Confirm'
    }
}


