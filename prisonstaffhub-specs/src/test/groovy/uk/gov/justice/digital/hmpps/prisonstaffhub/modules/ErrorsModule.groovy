package uk.gov.justice.digital.hmpps.keyworker.modules

import geb.Module

class ErrorsModule extends Module {

    static content = {
        message { $('.error-summary').text() }
    }
}
