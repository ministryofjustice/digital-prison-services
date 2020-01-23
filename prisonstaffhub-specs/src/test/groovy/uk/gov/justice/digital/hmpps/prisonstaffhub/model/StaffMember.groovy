package uk.gov.justice.digital.hmpps.prisonstaffhub.model

import groovy.transform.TupleConstructor

import static uk.gov.justice.digital.hmpps.prisonstaffhub.model.Caseload.*

@TupleConstructor
enum StaffMember {

    SM_1(-1, NWEB, NWEB, 'User', 'Elite2', 'API', true, "nomis"),
    SM_2(-2, LEI, LEI, 'User', 'API', 'ITAG', true, "nomis"),
    SM_3(-3, LEI, LEI, 'User', 'HPA', null, true, "nomis"),
    SM_4(-4, MUL, MUL, 'User', 'Test', null, true, "nomis"),
    SM_5(-5, LEI, LEI, 'User', 'Another', 'Test', true, "nomis"),
    SM_6(-6, MDI, MDI, 'Officer1', 'Wing', null, true, "nomis"),
    SM_7(-7, BXI, BXI, 'Officer2', 'Wing', null, true, "nomis"),
    SM_8(-8, WAI, WAI, 'Officer3', 'Wing', null, true, "nomis"),
    SM_9(-9, SYI, SYI, 'Officer4', 'Wing', null, true, "nomis"),
    SM_10(-10, LEI, LEI, 'Officer', 'Ex', null, false, "nomis")

    Integer id
    Caseload assginedCaseload
    Caseload workingCaseload
    String lastName
    String firstName
    String middleName
    Boolean active
    String authSource
}