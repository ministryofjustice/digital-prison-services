package uk.gov.justice.digital.hmpps.keyworker.mockapis.mockResponses


class KeyworkerDetailResponse {

    static getResponse(int staffId) {
        return """
{   "staffId": ${staffId},
    "firstName": "HPA${staffId}",
    "lastName": "AUser",
    "capacity": 6,
    "numberAllocated": 4,
    "scheduleType": "Full Time",
    "agencyId": "LEI",
    "agencyDescription": "LEEDS",
    "status": "ACTIVE",
    "autoAllocationAllowed": true}
"""
    }

    static response_keyworker_inactive = '''
{
    "staffId": -3,
    "firstName": "HPA",
    "lastName": "AUser",
    "capacity": 6,
    "numberAllocated": 0,
    "scheduleType": "Full Time",
    "agencyId": "LEI",
    "agencyDescription": "LEEDS",
    "status": "INACTIVE",
    "autoAllocationAllowed": true
}
'''
}
