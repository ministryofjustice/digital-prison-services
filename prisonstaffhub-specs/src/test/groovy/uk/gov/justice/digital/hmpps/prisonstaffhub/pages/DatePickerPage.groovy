package uk.gov.justice.digital.hmpps.prisonstaffhub.pages

import geb.Page

abstract class DatePickerPage extends Page {

    static content = {
        date { $('input', name: 'search-date') }
        topBar { $('th.rdtSwitch') }
        yearBox { value -> $('td', 'data-value': value) }
        monthBox { value -> $('td', text: value) }
        dayBox { value -> $('td.rdtDay:not(.rdtOld):not(.rdtNew)', 'data-value': value) }
    }

    void setDatePicker(year, month, day) {
        date.click()
        topBar.click()
        topBar.click()
        yearBox(year).click()
        monthBox(month).click()
        dayBox(day).click()
    }
}
