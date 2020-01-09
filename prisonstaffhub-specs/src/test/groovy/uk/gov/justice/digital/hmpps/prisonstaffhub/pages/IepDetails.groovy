package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class IepDetails extends Page {
    static url = '/offenders/A1234AC/iep-details'

    static at = {
        pageTitle == 'Incentive details for Norman Bates'
    }

    static content = {
        pageTitle { $('.inner-content h1').text() }
        breadcrumb {$('div[data-qa="breadcrumb"] li').children().collect{[it.text(), it.attr('href')]}}
        tableRows { $('.results tr') }
        labels { $'.label' }
        currentIepLevelData { $('.current-iep p')}
    }
}