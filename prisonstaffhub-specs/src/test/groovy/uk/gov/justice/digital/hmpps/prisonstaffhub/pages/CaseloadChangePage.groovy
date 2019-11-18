package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

public class CaseloadChangePage extends Page {
    static url = '/change-caseload'

    static at = {
        pageTitle == 'Change caseload'
    }

    static content = {
        pageTitle { $('h1').text() }
        select { $('#changeCaseloadSelect') }
        options { $('option')}
        submitButton { $('button')}
        cancelButton { $('.govuk-button--secondary')}
    }
}
