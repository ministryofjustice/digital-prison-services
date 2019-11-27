package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class BulkAppointmentsInvalidNumbersPage extends Page {
    static url = "/bulk-appointments/invalid-numbers"

    static content = {
        pageTitle { $("h1").first().text() }
        continueCTA {$('[data-qa="continue-with-invalid"]') }
        cancelCTA {$('[data-qa="upload-another-file"]') }
        prisonersNotFound {$('[data-qa="invalid-numbers-not-found"]') }
        prisonersDuplicated {$('[data-qa="invalid-numbers-duplicated"]') }
    }

    static at = {
        pageTitle == "Some appointments cannot be added"
        continueCTA.text() == "Continue"
        cancelCTA.text() == "Cancel"
    }
}
