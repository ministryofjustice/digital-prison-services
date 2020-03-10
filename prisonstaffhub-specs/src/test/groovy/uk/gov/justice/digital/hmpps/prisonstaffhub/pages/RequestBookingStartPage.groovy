package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class RequestBookingStartPage extends Page {
    static url = "/request-booking"

    static content = {
        pageTitle { $('h1').text() }
        form { $('form') }
        submitButton { $('button', type: 'submit') }
    }

    static at = {
        pageTitle.contains("Request video link date and time")
    }
}
