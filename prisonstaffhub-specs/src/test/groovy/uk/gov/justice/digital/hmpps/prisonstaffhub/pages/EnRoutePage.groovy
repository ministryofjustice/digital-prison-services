package uk.gov.justice.digital.hmpps.prisonstaffhub.pages
import geb.Page

class EnRoutePage  extends Page {
    static def agency
    static url = '/establishment-roll/en-route'

    static at = {
        pageTitle == "En route to ${agency}"
    }

    static content = {
        pageTitle { $('.inner-content h1').text() }
        tableRows { $('tbody tr') }
    }
}