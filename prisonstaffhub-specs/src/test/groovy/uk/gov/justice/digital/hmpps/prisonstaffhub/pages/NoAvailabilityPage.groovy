package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class NoAvailabilityPage extends Page {
    static at = {
        pageTitle == 'There are no video link bookings available'
    }

    static content = {
        pageTitle { $('.govuk-heading-l').text() }
        info { $('.govuk-body p').first().text() }
    }
}
