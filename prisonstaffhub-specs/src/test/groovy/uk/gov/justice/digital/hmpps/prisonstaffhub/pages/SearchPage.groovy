package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class SearchPage extends Page {

    static url = "/whereaboutssearch"

    static at = {
        headingText == 'Manage offender whereabouts'
        continueButton.displayed
    }

    static content = {
        headingText { $('h1').text() }
        header(required: false) { module(HeaderModule) }
        validationMessage(required: false) { $('#validation-message') }
        location { $('#housing-location-select') }
        activity { $('#activity-select') }
        date { $('#search-date') }
        datePicker { $('div.date-picker-component') } // click this to get picker
        days { $('td.rdtDay') } // days on picker, click to set date
        period { $('#period-select') }
        continueButton { $('button.button') }
        form { $('form')}
    }
}
