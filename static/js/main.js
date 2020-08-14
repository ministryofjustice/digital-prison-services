$(document).ready(function() {
  $('.date-input').each(function(index, element) {
    const disableFutureDates = Boolean($(element).data('disable-future-date'))
    const disablePastDates = Boolean($(element).data('disable-past-date'))
    const maxDate = disableFutureDates ? '0' : undefined
    const minDate = $(element).data('min-date') ? $(element).data('min-date') : disablePastDates ? '0' : undefined
    const dateFormat = 'dd/mm/yy'

    $(element).datepicker({
      dateFormat,
      showOtherMonths: true,
      selectOtherMonths: true,
      maxDate: maxDate,
      minDate: minDate,
    })
  })

  $('.js-prisoner-search-clear-alerts').click(function(e) {
    e.preventDefault()
    $('.js-prisoner-search-alerts input[type=checkbox]').prop('checked', false)
  })
})
