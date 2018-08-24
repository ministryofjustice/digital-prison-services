package uk.gov.justice.digital.hmpps.prisonstaffhub.pages


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
        bodyRows { $('table.row-gutters tr', 1..-1) }
        locations { bodyRows*.$('td', 1)*.text() }
        nomsIds { bodyRows*.$('td', 2)*.text()  }
        events { bodyRows*.$('td', 3)*.text() }
        eventsElsewhere { bodyRows*.$('td', 4).collect { it.$('ul li')*.text() } }
    }
}
