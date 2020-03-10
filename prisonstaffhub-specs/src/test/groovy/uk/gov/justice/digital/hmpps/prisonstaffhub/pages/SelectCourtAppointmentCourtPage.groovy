package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class SelectCourtAppointmentCourtPage extends Page {
    static url = "/LEI/offenders/A12345/add-court-appointment/select-court"

    static content = {
        pageTitle { $('h1').text() }
        selectCourtForm { $('form')}
        offenderName { $('.qa-name-value').text()}
        prison { $('.qa-prison-value').text()}
        date { $('.qa-date-value').text()}
        startTime { $('.qa-courtHearingStartTime-value').text()}
        endTime { $('.qa-courtHearingEndTime-value').text()}

        selectCourtSubmitButton { $('button', type: 'submit') }
    }

    static at = {
        pageTitle.contains("The video link date and time is available")
    }
}
