package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

import groovy.json.JsonOutput
import org.openqa.selenium.json.Json

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

    static existingRetentionRecord = JsonOutput.toJson(([
            offenderNo: 'A12345',
            userId: 'SOME_USER',
            modifiedDateTime: '2020-02-01T03:04:05.987654',
            retentionReasons: [
                    [
                            reasonCode: 'OTHER',
                            reasonDetails: 'Some other reason'
                    ]
            ]
    ]))
}
