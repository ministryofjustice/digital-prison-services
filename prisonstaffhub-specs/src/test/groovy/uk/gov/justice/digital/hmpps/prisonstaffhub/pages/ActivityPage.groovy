package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.AbsentFormModalModule
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class ActivityPage extends DatePickerPage {

    static url = "/manage-prisoner-whereabouts/activity-results"

    static at = {
        tableRows.size() > 1
    }

    static content = {
        activityTitle { $('h1').first().text() }
        header(required: false) { module(HeaderModule) }
        period { $('#period-select') }
        sortSelect { $('#sort-select') }

        form { $('form')}
        printButton { $('#printButton') }
        tableRows { $('table.row-gutters tr') } // Avoid the calendar table rows
        bodyRows { $('table.row-gutters tr', 1..-1) }
        locations { bodyRows*.$('td', 1)*.text() }
        nomsIds { bodyRows*.$('td', 2)*.text()  }
        flags { bodyRows*.$('td', 3)*.$('span') }
        events { bodyRows*.$('td', 4)*.text() }
        eventsElsewhere { bodyRows*.$('td', 5).collect { it.$('ul li')*.text() } }

        attendRadioElements(required: false) { bodyRows*.$('td[data-qa="pay-option"]')*.$('input') }
        notAttendedRadioElements(required: false) { bodyRows*.$('td[data-qa="other-option"]')*.$('input') }

        attendedValues(required: false) { bodyRows*.$('td[data-qa="pay-option"]')*.$('input')*.value() }
        absenseReasons(required: false) { bodyRows*.$('td[data-qa="other-option"]')*.$('span[data-qa="other-message"]')*.text() }

        absentReasonForm { module(AbsentFormModalModule) }
    }
}
