

package uk.gov.justice.digital.hmpps.keyworker.model

import groovy.transform.TupleConstructor

@TupleConstructor
public enum OmsRole {

    WING_OFF(-2, 'Wing Officer', 'WING_OFF'),
    LICENCE_CA(-100, 'Case Admin', 'LICENCE_CA'),
    LICENCE_RO(-101, 'Responsible Officer', 'LICENCE_RO'),
    KW_ADMIN(-201, 'Keyworker Admin', 'KW_ADMIN')

    Integer id
    String name
    String code
}
