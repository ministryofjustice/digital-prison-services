package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class AdjudicationDetailPage extends Page {

    static url = "/offenders/AA00112/adjudications/123456"

    static at = {
        pageTitle == 'Adjudication 123456 details'
        headerTitle == 'Digital Prison Services'
    }

    static content = {
        pageTitle { $('h1').text() }
        headerTitle { $('.page-header .title').text() }
        breadcrumb { $('div[data-qa="breadcrumb"] li').children().collect { [it.text(), it.attr('href')] } }
        sections {$('h3').collect{it.text()}}
    }
}
