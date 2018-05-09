package uk.gov.justice.digital.hmpps.keyworker.modules

import geb.Module

class HeaderModule extends Module {

    static content = {
        dropDown   { $('.info-wrapper') }
        username   { $('.info-wrapper .user-name').text() }
        caseload   { $('.info-wrapper .case-load').text() }
        logoutLink { $('a', text: 'Log out' ) }
    }

    def logout() {
        dropDown.click()
        waitFor { logoutLink.displayed }
        logoutLink.click()
    }

}
