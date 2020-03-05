package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ConfirmVideoLinkPrisonPage extends Page {
    static url = "/offenders/A12345/confirm-appointment"

    static content = {
        pageTitle { $('h1').text() }
        printMovementSlip { $('a.govuk-link').text() }
        backLink { $('a.govuk-button').text() }
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
        printMovementSlip.contains("Print movement slip")
        backLink.contains("Back to prisoner profile")
    }

}
