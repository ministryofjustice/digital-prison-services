package uk.gov.justice.digital.hmpps.prisonstaffhub.modules

import geb.Module

class AbsentFormModalModule extends Module {
    static content = {
        form(required: false) {$('.ReactModalPortal form') }
    }

    def fillOutAbsentReasonForm(payValue = 'yes', absentReasonValue = 'AcceptableAbsence', commentsValue = 'test') {
        waitFor { form.displayed}

        form.with {
            pay = payValue
            absentReason = absentReasonValue
            comments = commentsValue
            confirm().click()
        }

        waitFor { !form.displayed }

        return true
    }
}
