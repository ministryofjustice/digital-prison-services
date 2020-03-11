package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ConfirmVideoLinkCourtPage extends Page {
    static url = "/offenders/A12345/confirm-appointment"

    static content = {
        pageTitle { $('h1').text() }
        backLink { $('[data-qa="back-to-prisoner-search"]').text() }
        finishLink { $('a.govuk-button.govuk-button--primary').text() }
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
        backLink.contains("Create another video link")
        finishLink.contains("Exit")
    }

}
