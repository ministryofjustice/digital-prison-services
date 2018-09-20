package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class SearchPage extends DatePickerPage {

    static url = "/whereaboutssearch"

    static at = {
        headingText == 'Search prisoner whereabouts'
        continueButton.displayed
    }

    static content = {
        headingText { $('h1').text() }
        header(required: false) { module(HeaderModule) }
        validationMessage(required: false) { $('#validation-message') }
        location { $('#housing-location-select') }
        activity { $('#activity-select') }
        period { $('#period-select') }
        continueButton { $('#continue-housing') }
        form { $('form')}
    }
}
