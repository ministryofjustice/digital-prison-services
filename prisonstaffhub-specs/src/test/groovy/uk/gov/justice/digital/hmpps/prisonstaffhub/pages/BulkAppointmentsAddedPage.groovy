package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class BulkAppointmentsAddedPage extends Page {
    static url = "/bulk-appointments/appointments-added"

    static content = {
        pageTitle { $("h1").first().text() }
        printMovementsCTA {$("[data-qa='print-movement-slips']", href: "/bulk-appointments/appointments-movement-slips").text()}
        addMoreAppointmentsCTA {$("[data-qa='add-more-appointments']", href: "/bulk-appointments/add-more-appointments").text()}
        exitBulkAppointmentsCTA {$("[data-qa='exit-bulk-appointments']", href: "http://localhost:20200/").text()}
    }

    static at = {
        pageTitle == "The appointments have been added"
        printMovementsCTA == "Print movement authorisation slips"
        addMoreAppointmentsCTA == "Add more appointments"
        exitBulkAppointmentsCTA == "Exit to Digital Prison Services"
    }
}


