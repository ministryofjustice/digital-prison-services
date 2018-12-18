package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class GlobalSearchPage extends Page {
    static url = "/global-search-results"

    static at = {
        pageTitle == 'Global search results'
        headerTitle == 'Global search'
    }

    static content = {
        pageTitle { $('h1').text() }
        headerTitle { $('.page-header .title').text() }
        tableRows(required: false) { $('tr') }
        nextPage(required: false) { $('#next-page')}
        previousPage(required: false) { $('#previous-page')}
        searchAgainButton { $('#search-again') }
        searchInput { $('#search-text') }
        detailsDiv { $('#detailsDiv') }
        showFiltersLink { $('#showFiltersLink') }
        clearFiltersLink { $('#clearFilters') }
        locationSelect { $('#location-select') }
        genderSelect { $('#gender-select') }
        dobDay { $('input', 0, type: 'number') }
        dobMonth { $('input', 1, type: 'number') }
        dobYear { $('input', 2, type: 'number') }
    }
}
