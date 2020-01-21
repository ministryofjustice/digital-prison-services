package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class AddCourtAppointmentPage extends Page {
    static url = "/offenders/A12345/add-court-appointment"

    static content = {
        pageTitle { $('h1').text() }
        form { $('form')}
        submitButton { $('button', type: 'submit') }
        datePicker { $('#ui-datepicker-div')}
        activeDate { $('.ui-state-active')}
        offenderEvents {$("[data-qa='offender-events']")}
        locationEvents {$("[data-qa='location-events']")}
        errorSummary {$('.govuk-error-summary')}
    }

    static at = {
        pageTitle.contains("Add new hearing")
    }
}
