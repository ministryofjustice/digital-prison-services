package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class RequestBookingConfirmationPage extends Page{
    static url = "/request-booking/confirm"

    static content = {
        pageTitle { $('h1').text() }
        form { $('form') }
        submitButton { $('button', type: 'submit') }

        prison { $('.qa-prison-value').text()}
        name { $('.qa-name-value').text() }
        dateOfBirth { $('.qa-dateOfBirth-value').text() }
        date { $('.qa-date-value').text()}
        startTime { $('.qa-courtHearingStartTime-value').text()}
        endTime { $('.qa-courtHearingEndTime-value').text()}
        preStartEndTime { $('.qa-preCourtHearingBriefing-value').text()}
        postStartEndTime { $('.qa-postCourtHearingBriefing-value').text()}
        courtLocation { $('.qa-courtLocation-value').text() }
    }

    static at = {
        pageTitle.contains("The video link has been requested")
    }
}
