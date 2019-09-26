$(document).ready(function() {
  $('.date-input').each((index, element) => {
    var hideFutureDates = Boolean($(element).data('disable-future-date'))
    var hidePastDates = Boolean($(element).data('disable-past-date'))
    var maxDate = hideFutureDates ? '0' : undefined
    var minDate = hidePastDates ? '0' : undefined

    $(element).datepicker({
      dateFormat: 'dd/mm/yy',
      showOtherMonths: true,
      selectOtherMonths: true,
      maxDate: maxDate,
      minDate: minDate,
    })
  })
})
