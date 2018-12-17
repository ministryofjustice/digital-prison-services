package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class HouseblockPage extends DatePickerPage {

    static url = "/search-prisoner-whereabouts/housing-block-results"

    static at = {
        updateButton.displayed
    }

    static content = {
        headingText { $('h1').text() }
        header(required: false) { module(HeaderModule) }
        location { $('#housing-location-select') }
        period { $('#period-select') }
        form { $('form')}
        updateButton { $('#updateButton') }
        printButton { $('#printButton') }
        tableRows { $('table.row-gutters tr') } // Avoid the calendar table rows
        nameOrderLink { $('th #Name-sortable-column') }
        locationOrderLink { $('th #Location-sortable-column') }
    }
}
