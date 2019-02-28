package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class AddBulkAppointmentsPage extends Page {

    static url = "/add-bulk-appointments"

    static at = {
        pageTitle == "Add bulk appointments"
        appointmentTypesLoaded
    }

    static content = {
        pageTitle { $('h1').text() }
        header(required: false) { module(HeaderModule) }
        form { $('form')}
        appointmentTypesLoaded { $(name: 'appointmentType').find('option').size() > 1 }

        date { $(name: 'date') }
        topBar { $('th.rdtSwitch') }
        yearBox { value -> $('td', 'data-value': value) }
        monthBox { value -> $('td', text: value) }
        dayBox { value -> $('td.rdtDay:not(.rdtOld):not(.rdtNew)', 'data-value': value) }
        submitButton { $('button', type: 'submit') }
        tableRows { $('tbody tr') }
        successMessage { $('h3', text: 'Appointments have been successfully created.')}
    }



    void setDatePicker(year, month, day) {
        date.click()
        topBar.click()
        topBar.click()
        yearBox(year).click()
        monthBox(month).click()
        dayBox(day).click()
        form.click()
    }

    void enterAppointmentDetails(year) {
        form.appointmentType = "ACTI"
        form.location = 1
        form.comments = "test comment"

        setDatePicker(year, 'Aug', '1')

        setStartTime("10", "10")

        submitButton.click()
    }

    void setStartTime(String hours, String minutes) {
        $(name: 'hours').find("option").find{ it.value() == hours }.click()
        $(name: 'minutes').find("option").find{ it.value() == minutes }.click()

    }

    void selectFile() {
        File file = new File("build/resources/test/offenders-for-appointments.csv")
        String path = file.getAbsolutePath()
        form.file = file.getAbsolutePath()
    }
}

