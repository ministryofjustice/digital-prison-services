package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class SelectCourtAppointmentCourtPage extends Page {
    static url = "/LEI/offenders/A12345/add-court-appointment/select-court"

    static content = {
        pageTitle { $('h1').text() }
        selectCourtForm { $('form')}
        selectCourtSubmitButton { $('button', type: 'submit') }
    }

    static at = {
        pageTitle.contains("The video link date and time is available")
    }
}
