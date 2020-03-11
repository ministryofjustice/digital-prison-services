package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class PrisonerSearchResultsPage extends Page {
    static url = "/prisoner-search/results"

    static content = {
        pageTitle { $('h1').first().text() }
        searchResultsTable {$("[data-qa='search-results-table']")}
        bookVlbLinks {$("[data-qa='book-vlb-link']")}
    }

    static at = {
        pageTitle == "Search results"
    }
}
