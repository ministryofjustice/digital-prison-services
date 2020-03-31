package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class PrisonerSearchPage extends Page {
    static url = "/prisoner-search"

    static content = {
        pageTitle { $('h1').first().text() }
        form { $('form')}
        submitButton { $('button', type: 'submit') }
        errorSummary {$('.govuk-error-summary')}
        otherSearchDetails {$("[data-qa='other-search-details'] .govuk-details__summary-text")}
        searchResultsTable {$("[data-qa='search-results-table']")}
        bookVlbLinks {$("[data-qa='book-vlb-link']")}
    }

    static at = {
        pageTitle == "Search for a prisoner"
        submitButton.text() == 'Search'
    }
}
