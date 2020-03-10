package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class RequestBookingSelectCourtPage extends Page {
    static url = "/request-booking/select-court"

    static content = {
        pageTitle { $('h1').text() }
        form { $('form') }
        submitButton { $('button', type: 'submit') }

        prison { $('.qa-prison-value').text()}
        date { $('.qa-date-value').text()}
        startTime { $('.qa-courtHearingStartTime-value').text()}
        endTime { $('.qa-courtHearingEndTime-value').text()}
        preStartEndTime { $('.qa-pre-court').text() }
        postStartEndTime { $('.qa-post-court').text() }
    }

    static at = {
        pageTitle.contains("The video link date and time is available")
    }
}
