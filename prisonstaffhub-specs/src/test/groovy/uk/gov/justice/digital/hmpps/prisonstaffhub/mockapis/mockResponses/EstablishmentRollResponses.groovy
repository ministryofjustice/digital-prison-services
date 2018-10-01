package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

import groovy.json.JsonOutput

class EstablishmentRollResponses {
    static movementBlockResponse = [
            in  : 1,
            out : 2
    ]

    static assignedBlock1 = [
            livingUnitId       : 0,
            livingUnitDesc     : 'Housing Block 1',
            bedsInUse          : 156,
            currentlyInCell    : 154,
            currentlyOut       : 2,
            operationalCapacity: 170,
            netVacancies       : 14,
            maximumCapacity    : 0,
            availablePhysical  : 0,
            outOfOrder         : 0
    ]

    static assignedBlock2 = [
            livingUnitId       : 0,
            livingUnitDesc     : 'Housing Block 2',
            bedsInUse          : 172,
            currentlyInCell    : 172,
            currentlyOut       : 0,
            operationalCapacity: 180,
            netVacancies       : 8,
            maximumCapacity    : 0,
            availablePhysical  : 0,
            outOfOrder         : 1
    ]

    static assignedResponse = [
            assignedBlock1,
            assignedBlock2
    ]

    static unassignedBlock = [
            livingUnitId       : 0,
            livingUnitDesc     : 'Reception',
            bedsInUse          : 0,
            currentlyInCell    : 2,
            currentlyOut       : 2,
            operationalCapacity: 10,
            netVacancies       : 12,
            maximumCapacity    : 0,
            availablePhysical  : 0,
            outOfOrder         : 0
    ]

    static unassignedResponse = [
            unassignedBlock
    ]

}