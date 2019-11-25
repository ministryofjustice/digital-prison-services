package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class BulkAppointmentsPrisonersNotFoundPage extends Page {
    static url = "/bulk-appointments/prisoners-not-found"

    static content = {
        pageTitle { $("h1").first().text() }
        continueCTA {$('[data-qa="continue-with-invalid"]') }
        cancelCTA {$('[data-qa="upload-another-file"]') }
        prisonersNotFound {$('[data-qa="prisoners-not-found"]') }
    }

    static at = {
        pageTitle == "Some appointments cannot be added"
        continueCTA.text() == "Continue"
        cancelCTA.text() == "Cancel"
    }
}
