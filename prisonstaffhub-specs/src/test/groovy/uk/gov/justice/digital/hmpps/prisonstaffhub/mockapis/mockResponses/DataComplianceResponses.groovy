package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

import groovy.json.JsonOutput

class DataComplianceResponses {

    static retentionReasonHighProfile = [
            reasonCode: 'HIGH_PROFILE',
            displayName: 'High Profile Offenders',
            allowReasonDetails: false,
            displayOrder: 0
    ]

    static retentionReasonOther = [
            reasonCode: 'OTHER',
            displayName: 'Other',
            allowReasonDetails: true,
            displayOrder: 1
    ]

    static retentionReasons = JsonOutput.toJson([
            retentionReasonHighProfile,
            retentionReasonOther
    ])
}
