package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class EditAlertPage extends Page {
    static url = '/edit-alert?offenderNo=A12345&alertId=1'

    static at = {
        headingText == 'Change or close alert'
    }

    static content = {
        headingText { $('h1').first().text() }
        header(required: false) { module(HeaderModule) }
        comment { $(type: 'textarea')}
        closeAlertYesNo { $(type: 'radio') }
        submit { $(type: 'submit') }
        cancel { $('a', role: 'button') }
        form { $('form') }
    }
}
