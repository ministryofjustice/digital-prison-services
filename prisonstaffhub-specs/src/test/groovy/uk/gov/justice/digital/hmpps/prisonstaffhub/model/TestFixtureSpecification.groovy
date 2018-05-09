package uk.gov.justice.digital.hmpps.keyworker.model

import spock.lang.Specification

class TestFixtureSpecification extends Specification {

    def "Can obtain correct Locations for a Caseload"() {
        given: "A Caseload"
        Caseload caseload = Caseload.LEI

        when: "I calculate the Locations for that Caseload"
        List<Location> locations = TestFixture.locationsForCaseload(caseload)

        then: "The list of Locations is correct"
        assert locations.collect { it.description } == ['LEEDS', 'Block A', 'Block H']

    }
}
