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
        room { $('.qa-prisonRoom-value').text()}
        date { $('.qa-date-value').text()}
        startTime { $('.qa-courtHearingStartTime-value').text()}
        endTime { $('.qa-courtHearingEndTime-value').text()}
        legalBriefingBefore { $('.qa-preCourtHearingBriefing-value').text()}
        legalBriefingAfter { $('.qa-postCourtHearingBriefing-value').text()}
        courtLocation { $('.qa-courtLocation-value').text()}
    }

    static at = {
        pageTitle.contains("The video link has been booked")
        printMovementSlip.contains("Print movement slip")
        backLink.contains("Back to prisoner profile")
    }

}
