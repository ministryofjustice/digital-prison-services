package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class EstablishmentRollPage extends Page {
    static url = "/establishmentroll"

    static at = {
        pageTitle == 'Establishment roll'
    }

    static content = {
        pageTitle { $('h1').text() }
        blocks { $('.establishment-roll-block') } }
}
