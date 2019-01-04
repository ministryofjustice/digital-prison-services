package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class InReception  extends Page {
    static url = '/establishment-roll/in-reception'

    static at = {
        pageTitle == 'In reception'
    }

    static content = {
        pageTitle { $('.inner-content h1').text() }
        tableRows { $('tbody tr') }
        nameSortDesc { $('#Name-sort-desc') }
        nameSortAsc { $('#Name-sort-asc') }

        sortSelect { $('#sort-select') }
    }
}