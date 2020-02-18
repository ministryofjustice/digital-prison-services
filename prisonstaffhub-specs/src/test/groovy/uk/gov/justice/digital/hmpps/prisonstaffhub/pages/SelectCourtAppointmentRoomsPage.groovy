package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class SelectCourtAppointmentRoomsPage extends Page {

    static url = "/LEI/offenders/A12345/add-court-appointment/select-rooms"

    static content = {
        pageTitle { $('h1').text() }
        selectRoomsForm { $('form')}
        selectRoomsSubmitButton { $('button', type: 'submit') }
    }

    static at = {
        pageTitle.contains("Select an available room in the prison")
    }
}


