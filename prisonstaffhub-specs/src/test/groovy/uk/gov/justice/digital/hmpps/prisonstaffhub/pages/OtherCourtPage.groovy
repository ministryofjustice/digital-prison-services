package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class OtherCourtPage extends Page {
    static content = {
        pageTitle { $('h1').text() }
        form { $('form')}
        submitButton { $('button', type: 'submit') }
        cancelButton { $('.govuk-button--secondary') }
        errorSummary {$('.govuk-error-summary')}
    }

    static at = {
        pageTitle == "What is the name of the court?"
    }
}
