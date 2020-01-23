package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ConfirmVideoLinkPrisonPage extends Page {
    static url = "/offenders/A12345/confirm-appointment"

    static content = {
        pageTitle { $('h1').text() }
        printMovementSlip { $('a.govuk-link').text() }
        backLink { $('a.govuk-button').text() }
    }

    static at = {
        pageTitle.contains("Hearing added")
        printMovementSlip.contains("Print movement slip")
        backLink.contains("Back to prisoner profile")
    }

}
