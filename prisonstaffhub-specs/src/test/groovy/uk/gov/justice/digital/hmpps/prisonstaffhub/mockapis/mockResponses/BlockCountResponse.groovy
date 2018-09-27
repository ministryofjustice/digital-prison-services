package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

class BlockCountResponse {
    static blockCount1 = [
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

    static response = [
            blockCount1
    ]

}