package uk.gov.justice.digital.hmpps.prisonstaffhub.mockapis.mockResponses

class AdjudicationResponses {

    static offences = [
            [
                    id         : '142',
                    code       : '51:23AS',
                    description:
                            'Disobeys or fails to comply with any rule or regulation applying to him - offence against good order and discipline',
            ],
            [
                    id         : '92',
                    code       : '51:18A',
                    description:
                            'Absents himself from any place he is required to be or is present at any place where he is not authorised to be - absence without permission',
            ],
            [
                    id         : '80',
                    code       : '51:1J',
                    description: 'Commits any assault - assault on prison officer',
            ]
    ]

    static agencies = [
            [
                    agencyId   : 'MDI',
                    description: 'Moorland (HMP & YOI)',
                    agencyType : 'INST',
            ],
            [
                    agencyId   : 'ONI',
                    description: 'Onley (HMP)',
                    agencyType : 'INST',
            ]
    ]

    static historyResponse = [
            results: [
                    [
                            adjudicationNumber : 1492249,
                            reportTime         : '2017-02-23T10:29:00',
                            agencyIncidentId   : 1470044,
                            agencyId           : 'MDI',
                            adjudicationCharges: [
                                    [
                                            oicChargeId       : '1492249/1',
                                            offenceCode       : '51:18A',
                                            offenceDescription:
                                                    'Absents himself from any place he is required to be or is present at any place where he is not authorised to be - absence without permission',
                                            findingCode       : 'GUILTY'
                                    ]
                            ]
                    ],
                    [
                            adjudicationNumber : 554213,
                            reportTime         : '2012-01-05T15:42:00',
                            agencyIncidentId   : 548434,
                            agencyId           : 'ONI',
                            adjudicationCharges: [
                                    [
                                            oicChargeId       : '554213/2',
                                            offenceCode       : '51:1J',
                                            offenceDescription: 'Commits any assault - assault on prison officer',
                                            findingCode       : 'NOT_GUILTY',
                                    ],
                                    [
                                            oicChargeId       : '554213/1',
                                            offenceCode       : '51:25A',
                                            offenceDescription:
                                                    '(a) Attempts to commit, (b) incites another inmate to commit, or (c) assists another inmate to commit or to attempt to commit, any of the foregoing offences - attempt, incite or assist 8b',
                                    ]
                            ]
                    ],
                    [
                            adjudicationNumber : 529404,
                            reportTime         : '2011-11-03T15:22:00',
                            agencyIncidentId   : 524130,
                            agencyId           : 'ONI',
                            adjudicationCharges: [
                                    [
                                            oicChargeId       : '529404/1',
                                            offenceCode       : '51:23AS',
                                            offenceDescription:
                                                    'Disobeys or fails to comply with any rule or regulation applying to him - offence against good order and discipline',
                                            findingCode       : 'GUILTY'
                                    ]
                            ]
                    ]
            ],
            agencies: agencies,
            offences: offences,
    ]

    static mdihistoryResponse = [
            results: [
                    [
                            adjudicationNumber : 1492249,
                            reportTime         : '2017-02-23T10:29:00',
                            agencyIncidentId   : 1470044,
                            agencyId           : 'MDI',
                            adjudicationCharges: [
                                    [
                                            oicChargeId       : '1492249/1',
                                            offenceCode       : '51:18A',
                                            offenceDescription:
                                                    'Absents himself from any place he is required to be or is present at any place where he is not authorised to be - absence without permission',
                                            findingCode       : 'GUILTY'
                                    ]
                            ]
                    ],
            ],
            agencies: agencies,
            offences: offences,
    ]

    static dateFilteringhistoryResponse = [
            results: [
                    [
                            adjudicationNumber : 554213,
                            reportTime         : '2012-01-05T15:42:00',
                            agencyIncidentId   : 548434,
                            agencyId           : 'ONI',
                            adjudicationCharges: [
                                    [
                                            oicChargeId       : '554213/2',
                                            offenceCode       : '51:1J',
                                            offenceDescription: 'Commits any assault - assault on prison officer',
                                            findingCode       : 'NOT_GUILTY',
                                    ],
                                    [
                                            oicChargeId       : '554213/1',
                                            offenceCode       : '51:25A',
                                            offenceDescription:
                                                    '(a) Attempts to commit, (b) incites another inmate to commit, or (c) assists another inmate to commit or to attempt to commit, any of the foregoing offences - attempt, incite or assist 8b',
                                    ]
                            ]
                    ],
            ],
            agencies: agencies,
            offences: offences,
    ]
}
