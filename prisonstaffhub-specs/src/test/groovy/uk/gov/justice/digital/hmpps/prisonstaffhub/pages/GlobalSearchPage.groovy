package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class GlobalSearchPage extends Page {
    static url = "/globalsearch"

    static at = {
        pageTitle == 'Global search results'
    }

    static content = {
        pageTitle { $('h1.heading-large').text() }
        tableRows(required: false) { $('tr') }
        nextPage(required: false) { $('#next-page')}
        previousPage(required: false) { $('#previous-page')}
    }
}
