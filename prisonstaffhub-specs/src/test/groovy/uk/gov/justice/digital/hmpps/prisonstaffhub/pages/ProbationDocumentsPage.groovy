package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class ProbationDocumentsPage extends Page {
    static url = '/offenders/A1234AC/probation-documents'

    static at = {
        pageTitle == 'Documents held by probation'
    }

    static content = {
        pageTitle { $('h1').text() }
        breadcrumb {$('.govuk-breadcrumbs li').collect{[it.text(), it.find('a').attr('href')]}}
        convictionTitles {$('.govuk-accordion__section-heading').collect{it.text()}}
        documentTitles {$('.qa-document-link').collect{it.text()}}
        firstDocumentLink {$('.qa-document-link').first().attr('href')}
        accordionButtons {$('.govuk-accordion__section-button')}
    }
}