package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class IepHistory  extends Page {
    static url = '/offenders/A1234AC/iep-level'

    static at = {
        pageTitle == 'IEP History for NORMAN BATES'
    }

    static content = {
        pageTitle { $('.inner-content h1').text() }
        breadcrumb {$('div[data-qa="breadcrumb"] li').children().collect{[it.text(), it.attr('href')]}}
        tableRows { $('tbody tr') }
        labels { $'.label' }
        currentIepLevelData { $('p')}
    }
}