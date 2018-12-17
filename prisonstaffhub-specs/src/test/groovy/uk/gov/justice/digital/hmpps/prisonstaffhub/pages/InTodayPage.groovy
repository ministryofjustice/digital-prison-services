package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class InTodayPage  extends Page {
    static url = '/establishment-roll/in-today'

    static at = {
        pageTitle == 'In today'
    }

    static content = {
        pageTitle { $('.inner-content h1').text() }
        tableRows { $('tbody tr') }
    }
}