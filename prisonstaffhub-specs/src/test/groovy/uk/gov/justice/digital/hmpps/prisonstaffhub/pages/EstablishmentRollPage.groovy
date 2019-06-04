package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class EstablishmentRollPage extends Page {
    static url = "/establishment-roll"

    static at = {
        pageTitle == 'Establishment roll'
    }

    static content = {
        pageTitle { $('h1').first().text() }
        blocks { $('.establishment-roll-block') } }
}
