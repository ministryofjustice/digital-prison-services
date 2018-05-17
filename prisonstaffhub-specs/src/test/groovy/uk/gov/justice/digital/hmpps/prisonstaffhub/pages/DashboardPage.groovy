package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page
import uk.gov.justice.digital.hmpps.prisonstaffhub.model.UserAccount
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.ErrorsModule
import uk.gov.justice.digital.hmpps.prisonstaffhub.modules.HeaderModule

class DashboardPage extends Page {

    static url = "/"

    static at = {
        headingText == 'Prison staff hub'
    }

    static content = {
        headingText { $('h1').text() }
        header(required: false) { module(HeaderModule) }
        /*autoAllocateLink(to: UnallocatedPage) { $('#auto_allocate_link') }
        manualAssignLink(to: SearchForOffenderPage) { $('#assign_transfer_link') }
        keyworkerProfileLink(to: SearchForKeyworkerPage) { $('#keyworker_profile_link') }*/
    }

}
