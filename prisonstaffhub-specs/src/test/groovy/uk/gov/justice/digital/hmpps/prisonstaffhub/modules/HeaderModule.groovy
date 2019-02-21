package uk.gov.justice.digital.hmpps.prisonstaffhub.modules

import geb.Module

class HeaderModule extends Module {

    static content = {
        dropDown   { $('.info-wrapper') }
        username   { $('.info-wrapper .user-name').text() }
        caseload   { $('.info-wrapper .case-load').text() }
        caseloadSYI(required: false) { $('#menu-option-SYI') }
        logoutLink { $('a', text: 'Sign out' ) }
    }

    def logout() {
        dropDown.click()
        waitFor { logoutLink.displayed }
        logoutLink.click()
    }

    def switchCaseload(caseloadId) {
        dropDown.click()
        waitFor { logoutLink.displayed }
        caseloadSYI.click()
    }

}
