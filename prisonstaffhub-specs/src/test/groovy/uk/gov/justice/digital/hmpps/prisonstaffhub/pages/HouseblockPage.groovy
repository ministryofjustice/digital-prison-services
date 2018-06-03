package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class HouseblockPage extends Page {

    static url = "/whereabouts/resultshouseblock"

    static at = {
        saveButton.displayed
        // TODO set date ! printButton.displayed
    }

    static content = {
        headingText { $('h1').text() }
        header(required: false) { module(HeaderModule) }
        location { $('#housing-location-select') }
        date { $('#search-date') }
        period { $('#period-select') }
        saveButton { $('#saveButton') }
        printButton { $('#printButton') }
        tableRows { $('tr') }
    }
}
