package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class CurrentlyOutPage extends Page {
    static url = '/establishment-roll/123456/currently-out'

    static at = {
        pageTitle == 'Currently out - HB1'
    }

    static content = {
        pageTitle { $('.inner-content h1').text() }
        tableRows { $('tbody tr') }
    }

}
