package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class HouseblockPage extends Page {

    static url = "/whereaboutsresultshouseblock"

    static at = {
        updateButton.displayed
        saveButton[0].displayed
        saveButton[1].displayed
    }

    static content = {
        headingText { $('h1').text() }
        header(required: false) { module(HeaderModule) }
        location { $('#housing-location-select') }
        date { $('#search-date') }// click this to get picker
        days { $('td.rdtDay') } // days on picker, click to set date
        firstDay { $('td.rdtDay[data-value="1"]')[0] } // 1st of month
        period { $('#period-select') }
        form { $('form')}
        updateButton { $('#updateButton') }
        saveButton { $('#saveButton') }
        printButton { $('#printButton') }
        tableRows { $('table.row-gutters tr') } // Avoid the calendar table rows
        nameOrderLink { $('th a#Name-sortable-column') }
        locationOrderLink { $('th a#Location-sortable-column') }
    }
}
