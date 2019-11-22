package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class NewNomisLandingPage extends Page {
    static at = {
        headingText == "New nomis ui"
    }

    static content = {
        headingText { $('h1').first().text() }
    }
}
