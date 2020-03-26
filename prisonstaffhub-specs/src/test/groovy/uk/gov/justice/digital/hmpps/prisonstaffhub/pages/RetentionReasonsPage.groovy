package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class RetentionReasonsPage extends Page {

    static url = "/offenders/A12345/retention-reasons"

    static content = {
        pageTitle { $('h1').text() }
    }

    static at = {
        pageTitle.contains("Prevent removal of this record")
    }
}

