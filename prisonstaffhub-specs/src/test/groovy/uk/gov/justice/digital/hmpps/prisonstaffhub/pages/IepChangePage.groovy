package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class IepChangePage extends Page {
    static url = '/offenders/A1234AC/iep-details/change-iep'

    static at = {
        pageTitle == 'Change IEP level'
    }

    static content = {
        pageTitle { $('.inner-content h1').text() }
        breadcrumb {$('div[data-qa="breadcrumb"] li').children().collect{[it.text(), it.attr('href')]}}
        formLabel {$('fieldset legend').text() }
        reasonInput {$('textarea', name: 'reason')}
        basicInput {$('input', value: 'BAS')}
        standardInput {$('input', value: 'STD')}
        submitButton {$('button', 'type': 'submit')}
        cancelButton {$('button', 'text': 'Cancel')}
    }
}
