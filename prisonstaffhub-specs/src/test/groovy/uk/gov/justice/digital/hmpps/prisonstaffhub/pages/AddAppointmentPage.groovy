package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class AddAppointmentPage extends Page {
    static url = "/offenders/A12345/add-appointment"

    static content = {
        pageTitle { $('h1').text() }
        form { $('form')}
        submitButton { $('button', type: 'submit') }
        datePicker { $('#ui-datepicker-div')}
        activeDate { $('.ui-state-active')}
        recurringInputs {$("[data-qa='recurring-inputs']")}
        offenderClashes {$("[data-qa='offender-clashes']")}
        errorSummary {$('.govuk-error-summary')}
    }

    static at = {
        pageTitle.contains("Add new appointment")
    }
}

