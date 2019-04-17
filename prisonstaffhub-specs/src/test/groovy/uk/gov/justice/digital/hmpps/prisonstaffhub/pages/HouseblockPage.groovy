package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class HouseblockPage extends DatePickerPage {

    static url = "/search-prisoner-whereabouts/housing-block-results"

    static at = {
        updateButton.displayed
        tableRows.size() > 1
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
