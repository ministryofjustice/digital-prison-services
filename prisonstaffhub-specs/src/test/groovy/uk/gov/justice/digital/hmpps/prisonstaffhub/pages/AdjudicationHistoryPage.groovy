package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

class AdjudicationHistoryPage extends Page {

    static at = {
        pageTitle == 'Adjudication history'
        headerTitle == 'Digital Prison Services'
    }

    static content = {
        pageTitle { $('h1').text() }
        headerTitle { $('.page-header .title').text() }
        tableRows(required: false) { $('.results tr') }
        establishmentSelect { $('#establishment-select select') }
        applyFilter { $('#apply-filter') }
        clearFiltersLink { $('#clear-filters') }

        fromDate { $('input', name: 'fromDate') }
        fromDateTopBar { $('#from-date th.rdtSwitch') }
        fromDateYearBox { value -> $("#from-date .rdtYears td[data-value='${value}']") }
        fromDateMonthBox { value -> $("#from-date .rdtMonths td[data-value='${value}']") }
        fromDateDayBox { value -> $("#from-date td.rdtDay:not(.rdtOld):not(.rdtNew)[data-value='${value}']") }

        toDate { $('input', name: 'toDate') }
        toDateTopBar { $('#to-date th.rdtSwitch') }
        toDateYearBox { value -> $("#to-date .rdtYears td[data-value='${value}']") }
        toDateMonthBox { value -> $("#to-date .rdtMonths td[data-value='${value}']") }
        toDateDayBox { value -> $("#to-date td.rdtDay:not(.rdtOld):not(.rdtNew)[data-value='${value}']") }
    }

    void setFromDate(year, month, day) {
        fromDate.click()
        fromDateTopBar.click()
        fromDateTopBar.click()
        fromDateYearBox(year).click()
        fromDateMonthBox(month).click()
        fromDateDayBox(day).click()
    }

    void setToDate(year, month, day) {
        toDate.click()
        toDateTopBar.click()
        toDateTopBar.click()
        toDateYearBox(year).click()
        toDateMonthBox(month).click()
        toDateDayBox(day).click()
    }
}
