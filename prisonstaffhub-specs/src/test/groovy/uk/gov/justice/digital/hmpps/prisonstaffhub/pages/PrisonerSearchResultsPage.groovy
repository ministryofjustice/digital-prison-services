package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class PrisonerSearchResultsPage extends Page {
    static url = "/prisoner-search/results"

    static content = {
        pageTitle { $('h1').first().text() }
        searchResultsTable {$("[data-qa='search-results-table']")}
        bookAppointmentLinks {$("[data-qa='book-appointment-link']")}
    }

    static at = {
        pageTitle == "Search results"
    }
}
