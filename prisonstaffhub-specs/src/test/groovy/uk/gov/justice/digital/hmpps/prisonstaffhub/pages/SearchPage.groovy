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
        location { $('#housing-location-select') }
        date { $('#search-date') }
        period { $('#period-select') }
        continueButton { $('button.button') }
        form { $('form')}
    }
}
