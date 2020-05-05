package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class AttendanceStatsDashboardPage extends Page {
    static content = {
        pageTitle { $('h1').text() }
        form { $('form')}
        submitButton { $('button', type: 'submit') }
        errorSummary { $('.govuk-error-summary')}

        changes(required: false) { $('[data-qa="changes"]').first() }

        unaccountedfor(required: false) { $('[data-qa="unaccountedfor"]').first() }
        suspended(required: false) { $('[data-qa="suspended"]').first() }
        attended(required: false) { $('[data-qa="attended"]').first() }

        acceptableAbsence(required: false) { $('[data-qa="AcceptableAbsence"]').first() }
        approvedCourse(required: false) { $('[data-qa="ApprovedCourse"]').first() }
        notRequired(required: false) { $('[data-qa="NotRequired"]').first() }

        refused (required: false) { $('[data-qa="Refused"]').first() }
        refusedWithWarning(required: false) { $('[data-qa="RefusedIncentiveLevelWarning"]').first() }
        restDay(required: false)  { $('[data-qa="RestDay"]').first() }
        restInCellOrSick(required: false) { $('[data-qa="RestInCellOrSick"]').first() }

        sessionCancelled(required: false) { $('[data-qa="SessionCancelled"]').first() }
        unacceptableAbsenceWithWarning(required: false) { $('[data-qa="UnacceptableAbsence"]').first()}
    }

    static at = {
        pageTitle.contains("Attendance reason statistics")
    }
}
