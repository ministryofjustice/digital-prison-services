package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class BulkAppointmentsClashesPage extends Page {
    static url = "/bulk-appointments/appointment-clashes"

    static content = {
        pageTitle { $("h1").first().text() }
        submitButton { $('button', type: 'submit') }
        form { $('form')}
        prisonersWithClashes {$('[data-qa="prisoners-with-clashes"]') }
    }

    static at = {
        pageTitle == "Appointment clashes"
        submitButton.text() == 'Confirm'
    }
}
