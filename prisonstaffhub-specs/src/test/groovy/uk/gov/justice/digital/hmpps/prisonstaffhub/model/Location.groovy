package uk.gov.justice.digital.hmpps.keyworker.model

import groovy.transform.Canonical
import groovy.transform.Immutable

@Immutable
class Location {

    private Integer locationId;
    private String locationType;
    private String description;
    private String agencyId;
    private Integer currentOccupancy;
    private String locationPrefix;
    private String userDescription;
//    private String locationUsage;
//    private Long parentLocationId;
//    private Integer operationalCapacity;

    static Location toLocation(AgencyLocation agencyLocation) {
        new Location(
                locationId: -1,
                locationType: agencyLocation.type,
                description: agencyLocation.description,
                agencyId: agencyLocation.id,
                locationPrefix: agencyLocation.id)
    }

    static Location toLocation(AgencyInternalLocation internalLocation) {
        return new Location(
                locationId: internalLocation.id,
                locationType: internalLocation.type,
                description: internalLocation.userDescription,
                agencyId: internalLocation.agencyLocation.id,
                currentOccupancy: 0,
                locationPrefix: internalLocation.description
        )
    }
}