package uk.gov.justice.digital.hmpps.prisonstaffhub.pages


import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class ActivityPage extends DatePickerPage {

    static url = "/search-prisoner-whereabouts/activity-results"

    static at = {
        updateButton.displayed
    }

    static content = {
        activityTitle { $('h1').text() }
        header(required: false) { module(HeaderModule) }
        period { $('#period-select') }
        sortSelect { $('#sort-select') }

        form { $('form')}
        updateButton { $('#updateButton') }
        printButton { $('#printButton') }
        tableRows { $('table.row-gutters tr') } // Avoid the calendar table rows
        bodyRows { $('table.row-gutters tr', 1..-1) }
        locations { bodyRows*.$('td', 1)*.text() }
        nomsIds { bodyRows*.$('td', 2)*.text()  }
        flags { bodyRows*.$('td', 3)*.$('span') }
        events { bodyRows*.$('td', 4)*.text() }
        eventsElsewhere { bodyRows*.$('td', 5).collect { it.$('ul li')*.text() } }
    }
}
