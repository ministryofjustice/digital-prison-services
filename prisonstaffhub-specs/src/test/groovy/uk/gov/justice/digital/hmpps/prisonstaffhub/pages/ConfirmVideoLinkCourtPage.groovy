package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ConfirmVideoLinkCourtPage extends Page {
    static url = "/offenders/A12345/confirm-appointment"

    static content = {
        pageTitle { $('h1').text() }
        backLink { $('a.govuk-button').text() }
    }

    static at = {
        pageTitle.contains("The video link booking has been created")
        backLink.contains("Back to prisoner search")
    }

}
