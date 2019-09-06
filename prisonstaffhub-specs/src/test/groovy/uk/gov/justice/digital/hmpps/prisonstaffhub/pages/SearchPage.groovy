package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class SearchPage extends DatePickerPage {

    static url = "/manage-prisoner-whereabouts"

    static at = {
        headingText == 'Manage prisoner whereabouts'
        continueButton.displayed
        location.find('option')[1].text() == '1'
    }

    static content = {
        headingText { $('h1').first().text() }
        header(required: false) { module(HeaderModule) }
        validationMessage(required: false) { $('#validation-message') }
        location { $('#housing-location-select') }
        activity { $('#activity-select') }
        period { $('#period-select') }
        continueButton { $('#continue-housing') }
        form { $('form')}
    }
}
