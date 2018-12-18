package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class OutTodayPage  extends Page {
    static url = '/establishment-roll/out-today'

    static at = {
        pageTitle == 'Out today'
    }

    static content = {
        pageTitle { $('.inner-content h1').text() }
        tableRows { $('tbody tr') }
        nameSortDesc { $('#Name-sort-desc') }
        nameSortAsc { $('#Name-sort-asc') }

        sortSelect { $('#sort-select') }
    }
}