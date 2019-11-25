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

    void selectFile(String path) {
        File file = new File(path)
        form.file = file.absolutePath
    }
}

