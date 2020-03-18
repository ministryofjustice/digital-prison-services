package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class VideoLinkPage extends Page {

    static url = "/videolink"

    static content = {
        pageTitle { $('h1').first().text() }
        bookingTitle { $('h2').first().text() }
        appointmentListTitle { $('h2')[1].text() }
        courtServiceFooter { $('.qa-court-service-footer')}
    }

    static at = {
        pageTitle == "Book a video link with a prison"
    }

}
