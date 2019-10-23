package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class BulkAppointmentsAddPage extends Page {
    static url = "/bulk-appointments/add-appointment-details"

    static content = {
        pageTitle { $('h1').first().text() }
        form { $('form')}
        appointmentTypesLoaded { $(name: 'appointmentType').find('option').size() > 1 }
        submitButton { $('button', type: 'submit') }
        datePicker { $('#ui-datepicker-div')}
        activeDate { $('.ui-state-active')}
        recurringInputs {$("[data-qa='recurring-inputs']")}
    }

    static at = {
        pageTitle == "Add appointment details"
        submitButton.text() == 'Continue'
        appointmentTypesLoaded
    }

    void enterBasicAppointmentDetails(String startDate) {
        form.appointmentType = "ACTI"
        form.location = 1
        form.date = startDate
        activeDate.click()
        waitFor { datePicker.displayed == false}
    }
}

