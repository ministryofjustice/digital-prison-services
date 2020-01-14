package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class VideoLinkPage extends Page {

    static url = "/videolink"

    static content = {
        pageTitle { $('h1').first().text() }
        bookingTitle { $('h2').first().text() }
        appointmentListTitle { $('h2')[1].text() }
    }

    static at = {
        pageTitle == "Videolink appointment booking"
    }

}
