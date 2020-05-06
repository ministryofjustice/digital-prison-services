package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class AttendanceSuspendedPage extends Page {
    static content = {
        pageTitle { $('h1').text() }
        tableRows {$("table tr")}
    }

    static at = {
        pageTitle.contains("Suspended")
    }
}
