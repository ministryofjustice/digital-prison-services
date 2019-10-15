package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class BulkAppointmentsNotAddedPage extends Page {
    static url = "/bulk-appointments/no-appointments-added"

    static content = {
        pageTitle { $("h1").first().text() }
        notAddedMessage {$("[data-qa='appointments-not-added-message']").text()}
        uploadAnotherFileCTA {$("[data-qa='upload-another-file']", href: "/bulk-appointments/upload-file").text()}
        exitBulkAppointmentsCTA {$("[data-qa='exit-bulk-appointments']", href: "http://localhost:20200/").text()}
    }

    static at = {
        pageTitle == "No appointments have been added"
        uploadAnotherFileCTA == "Upload another CSV file"
        exitBulkAppointmentsCTA == "Exit to Digital Prison Services"
    }
}
