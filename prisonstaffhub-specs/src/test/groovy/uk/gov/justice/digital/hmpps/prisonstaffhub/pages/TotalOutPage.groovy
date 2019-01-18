package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class TotalOutPage extends Page {
    static url = '/establishment-roll/total-currently-out'

    static at = {
        pageTitle == 'Total currently out'
    }

    static content = {
        pageTitle { $('.inner-content h1').text() }
        tableRows { $('tbody tr') }
    }

}

