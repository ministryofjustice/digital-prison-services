package uk.gov.justice.digital.hmpps.keyworker.model

import groovy.transform.TupleConstructor

import static StaffMember.*
import static UserType.*
import static Caseload.*

@TupleConstructor
enum UserAccount {

    ELITE2_API_USER('ELITE2_API_USER', SM_1, GENERAL, NWEB, []),
    ITAG_USER('ITAG_USER', SM_2, GENERAL, LEI, [BXI, LEI, MDI, SYI, WAI]),
    API_TEST_USER('API_TEST_USER', SM_4, GENERAL, MUL, [MUL]),
    EXOFF5('EXOFF5', SM_10, GENERAL, LEI, []),

    NOT_KNOWN('NOT_KNOWN', null, null, null, [])

    String username
    StaffMember staffMember
    UserType type
    Caseload workingCaseload
    List<Caseload> caseloads
}
