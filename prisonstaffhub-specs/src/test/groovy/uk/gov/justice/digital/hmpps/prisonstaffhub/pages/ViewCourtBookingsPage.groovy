package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ViewCourtBookingsPage extends Page {
    static url = "/videolink/bookings"

    static content = {
        pageTitle { $('h1').first().text() }
        searchResultsTableRows {$("[data-qa='court-bookings-table'] tr")}
        noResultsMessage {$("[data-qa='no-results-message']")}
        form { $('form')}
        submitButton { $('button', type: 'submit') }
    }

    static at = {
        pageTitle.contains("Video link bookings for")
    }
}
