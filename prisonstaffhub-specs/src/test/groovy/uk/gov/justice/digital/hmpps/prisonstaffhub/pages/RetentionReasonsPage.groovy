package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class RetentionReasonsPage extends Page {

    static url = "/offenders/A12345/retention-reasons"

    static content = {
        pageTitle { $('h1').text() }

        offenderImage { $('[data-qa="offender-image"]') }
        offenderName { $('[data-qa="offender-name"]').text() }
        offenderNumber { $('[data-qa="offender-no"]').text() }
        offenderDob { $('[data-qa="dob"]').text() }
        offenderAgency { $('[data-qa="agency"]').text() }

        checkBoxHighProfile { $('#retention-reason-HIGH_PROFILE') }
        checkBoxOther { $('#retention-reason-OTHER') }
        moreDetailOther { $('#more-detail-OTHER') }

        updateButton {$('button', 'text': 'Update')}
        cancelButton {$('a', 'text': 'Cancel')}

        lastUpdateTimestamp { $('#last-update-timestamp').text() }
        lastUpdateUser { $('#last-update-user').text() }

        errorSummary { $('div.govuk-error-summary') }
    }

    static at = {
        pageTitle.contains("Prevent removal of this record")
    }
}

