package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class BulkAppointmentsUploadCSVPage extends Page {
    static url = "/bulk-appointments/upload-file"

    static content = {
        pageTitle { $('h1').first().text() }
        form { $('form')}
        submitButton { $('button', type: 'submit') }
    }

    static at = {
        pageTitle == "Upload a CSV File"
        submitButton.text() == 'Continue'
    }

    void selectFile() {
        File file = new File("src/test/resources/offenders-for-appointments.csv")
        form.file = file.absolutePath
    }
}

