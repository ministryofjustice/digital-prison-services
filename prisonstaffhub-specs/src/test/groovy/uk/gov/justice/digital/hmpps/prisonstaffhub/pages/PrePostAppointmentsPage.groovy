package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class PrePostAppointmentsPage extends Page {
    static url = "/offenders/A12345/prepost-appointments"

    static content = {
        pageTitle { $('h1').text() }
        prePostForm { $('form')}
        prePostSubmitButton { $('button', type: 'submit') }
        errorSummary {$('.govuk-error-summary')}
    }

    static at = {
        pageTitle.contains("Video link booking details")
    }
}
