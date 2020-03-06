package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ViewAppointmentsPage extends Page {
    static url = "/appointments"

    static content = {
        pageTitle { $('h1').first().text() }
        searchResultsTableRows {$("[data-qa='appointments-table'] tr")}
        noResultsMessage {$("[data-qa='no-results-message']")}
        form { $('form')}
        submitButton { $('button', type: 'submit') }
    }

    static at = {
        pageTitle.contains("Appointments for")
    }
}
