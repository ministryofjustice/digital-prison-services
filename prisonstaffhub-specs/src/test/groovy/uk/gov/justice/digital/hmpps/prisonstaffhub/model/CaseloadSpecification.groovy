package uk.gov.justice.digital.hmpps.keyworker.model

import spock.lang.Specification

class CaseloadSpecification extends Specification {

    def "All Caseloads have a list of AgencyLocation"() {
        given: "All the Caseloads"
        Caseload[] caseloads = Caseload.values()

        expect: "Every Caseload has a non-null list of AgencyLocation"
        caseloads.each {
            it.locations != null
        }

        and: "Some have a non-empty list"
        assert Caseload.LEI.locations == [AgencyLocation.LEI]
        assert Caseload.MUL.locations == [AgencyLocation.BXI, AgencyLocation.LEI]
    }

}
