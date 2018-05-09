package uk.gov.justice.digital.hmpps.keyworker.model

import spock.lang.Specification

class LocationSpecification extends Specification {

    def "I can construct a Location from an AgencyLocation"() {
        given: "An AgencyLocation"
        AgencyLocation al = AgencyLocation.LEI

        when: "I map it using the Location.toLocation method"
        Location location = Location.toLocation(al)

        then: "I have a correctly mapped Location"
        with(location) {
            locationId == -1
            locationType == al.type
            description == al.description
            agencyId == al.id
            locationPrefix == al.id
            currentOccupancy == null
            userDescription == null
        }
    }

    def "I can construct a Location from an AgencyInternalLocation"() {
        given: "An AgencyInternalLocation"
        AgencyInternalLocation ail = AgencyInternalLocation.LEI_H

        when: "I map it using the Location.toLocation method"
        Location location = Location.toLocation(ail)

        then: "I have a correctly mapped Location"
        with(location) {
            locationId == ail.id
            locationType == ail.type
            description == ail.userDescription
            agencyId == ail.agencyLocation.id
            currentOccupancy == 0
            locationPrefix == ail.description
        }
    }

}
