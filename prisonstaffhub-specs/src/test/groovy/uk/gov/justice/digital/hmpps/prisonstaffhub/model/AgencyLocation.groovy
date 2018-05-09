package uk.gov.justice.digital.hmpps.keyworker.model

import groovy.transform.TupleConstructor

@TupleConstructor
enum AgencyLocation {
    BXI('BXI', 'BRIXTON', 'INST', true),
    BMI('BMI', 'BIRMINGHAM', 'INST', true),
    LEI('LEI', 'LEEDS', 'INST', true),
    WAI('WAI', 'THE WEARE', 'INST', true),
    OUT('OUT', 'OUTSIDE', 'INST', true),
    TRN('TRN', 'TRANSFER', 'INST', true),
    MUL('MUL', 'MUL', 'INST', true),
    ZZGHI('ZZGHI', 'GHOST', 'INST', false),
    COURT1('COURT1', 'Court 1', 'CRT', true),
    ABDRCT('ABDRCT', 'Court 2', 'CRT', true),
    TRO('TRO', 'TROOM', 'INST', true),
    MDI('MDI', 'MOORLAND', 'INST', true),
    SYI('SYI', 'SHREWSBURY', 'INST', true)

    String id
    String description
    String type
    Boolean active
}
