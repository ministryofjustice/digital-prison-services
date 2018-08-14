package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class ActivityPage extends Page {

    static url = "/whereaboutsresultsactivity"

    static at = {
        updateButton.displayed
    }

    static content = {
        activityTitle { $('h1.whereabouts-title').text() }
        header(required: false) { module(HeaderModule) }
        date { $('#search-date') }// click this to get picker
        days { $('td.rdtDay') } // days on picker, click to set date
        firstDay { $('td.rdtDay[data-value="1"]')[0] } // 1st of month
        period { $('#period-select') }
        form { $('form')}
        updateButton { $('#updateButton') }
        printButton { $('#printButton') }
        tableRows { $('table.row-gutters tr') } // Avoid the calendar table rows
    }
}
