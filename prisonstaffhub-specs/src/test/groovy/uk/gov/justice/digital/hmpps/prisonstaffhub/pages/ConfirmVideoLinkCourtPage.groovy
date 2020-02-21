package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ConfirmVideoLinkCourtPage extends Page {
    static url = "/offenders/A12345/confirm-appointment"

    static content = {
        pageTitle { $('h1').text() }
        backLink { $('a.govuk-button.govuk-button--primary').text() }
        finishLink { $('a.govuk-button.govuk-button--secondary').text() }
    }

    static at = {
        pageTitle.contains("The video link has been created")
        backLink.contains("Create another video link")
        finishLink.contains("Finish")
    }

}
