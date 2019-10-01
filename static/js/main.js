$(document).ready(function() {
  $('.date-input').each((index, element) => {
    var disableFutureDates = Boolean($(element).data('disable-future-date'))
    var disablePastDates = Boolean($(element).data('disable-past-date'))
    var maxDate = disableFutureDates ? '0' : undefined
    var minDate = disablePastDates ? '0' : undefined

    $(element).datepicker({
      dateFormat: 'dd/mm/yy',
      showOtherMonths: true,
      selectOtherMonths: true,
      maxDate: maxDate,
      minDate: minDate,
    })
  })
})
