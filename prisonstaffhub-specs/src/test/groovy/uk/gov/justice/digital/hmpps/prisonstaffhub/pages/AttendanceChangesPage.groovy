package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class AttendanceChangesPage extends Page {
    static content = {
        pageTitle { $('h1').text() }
        tableRows {$("table tr")}
    }

    static at = {
        pageTitle.contains("Changes to attendance reason")
    }
}
