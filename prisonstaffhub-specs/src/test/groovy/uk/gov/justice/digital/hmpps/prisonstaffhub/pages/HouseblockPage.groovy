package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class HouseblockPage extends Page {

    static url = "/whereabouts/resultshouseblock"

    static at = {
        updateButton.displayed
        saveButton[0].displayed
        printButton[0].displayed
    }

    static content = {
        headingText { $('h1').text() }
        header(required: false) { module(HeaderModule) }
        location { $('#housing-location-select') }
        date { $('#search-date') }
        datePicker { $('div.date-picker-component') } // click this to get picker
        days { $('td.rdtDay') } // days on picker, click to set date
        period { $('#period-select') }
        form { $('form')}
        updateButton { $('#updateButton') }
        saveButton { $('#saveButton') }
        printButton { $('#printButton') }
        tableRows { $('table.row-gutters tr') } // Avoid the calendar table rows
        orderLink { $('th a') }
    }
}
