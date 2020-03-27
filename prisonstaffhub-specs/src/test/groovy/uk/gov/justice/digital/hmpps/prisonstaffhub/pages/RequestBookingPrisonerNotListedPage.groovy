package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class RequestBookingPrisonerNotListedPage extends Page {
    static url = "/request-booking/prisoner-not-listed"

    static content = {
        pageTitle { $('h1').text() }
        continueButton { $('a.govuk-button') }
        searchAgainLink { $('a.govuk-link') }
    }

    static at = {
        pageTitle.contains("You can request a video link booking for a prisoner")
    }
}
