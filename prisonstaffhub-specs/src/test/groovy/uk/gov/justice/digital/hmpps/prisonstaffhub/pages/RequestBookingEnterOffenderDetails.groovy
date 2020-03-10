package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class RequestBookingEnterOffenderDetails extends Page {
    static url = "/request-booking/enter-offender-details"

    static content = {
        pageTitle { $('h1').text() }
        form { $('form') }
        submitButton { $('button', type: 'submit') }
    }

    static at = {
        pageTitle.contains("Who is the video link for?")
    }
}
