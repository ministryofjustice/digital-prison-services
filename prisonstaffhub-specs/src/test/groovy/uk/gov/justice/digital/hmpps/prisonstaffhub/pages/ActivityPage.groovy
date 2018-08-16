package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class ActivityPage extends DatePickerPage {

    static url = "/whereaboutsresultsactivity"

    static at = {
        updateButton.displayed
    }

    static content = {
        activityTitle { $('h1.whereabouts-title').text() }
        header(required: false) { module(HeaderModule) }
        period { $('#period-select') }
        form { $('form')}
        updateButton { $('#updateButton') }
        printButton { $('#printButton') }
        tableRows { $('table.row-gutters tr') } // Avoid the calendar table rows
    }
}
