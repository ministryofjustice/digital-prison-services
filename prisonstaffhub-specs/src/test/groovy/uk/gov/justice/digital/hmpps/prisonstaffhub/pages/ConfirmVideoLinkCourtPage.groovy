package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ConfirmVideoLinkCourtPage extends Page {
    static url = "/offenders/A12345/confirm-appointment"

    static content = {
        pageTitle { $('h1').text() }
        backLink { $('a.govuk-button.govuk-button--primary').text() }
        finishLink { $('a.govuk-button.govuk-button--secondary').text() }
        offenderName { $('.qa-name-value').text()}
        prison { $('.qa-prison-value').text()}
        room { $('.qa-room-value').text()}
        date { $('.qa-date-value').text()}
        startTime { $('.qa-startTime-value').text()}
        endTime { $('.qa-endTime-value').text()}
        legalBriefingBefore { $('.qa-legalBriefingBefore-value').text()}
        legalBriefingAfter { $('.qa-legalBriefingAfter-value').text()}
        courtLocation { $('.qa-courtLocation-value').text()}
    }

    static at = {
        pageTitle.contains("The video link has been created")
        backLink.contains("Create another video link")
        finishLink.contains("Finish")
    }

}
