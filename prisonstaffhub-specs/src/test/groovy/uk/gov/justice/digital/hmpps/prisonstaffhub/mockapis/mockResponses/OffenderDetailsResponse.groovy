package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

import groovy.json.JsonOutput;

class OffenderDetailsResponse {

    static def response(String firstName, String lastName) {
        JsonOutput.toJson([
                'firstName': "${firstName}",
                'lastName' : "${lastName}",
        ])
    }

}
