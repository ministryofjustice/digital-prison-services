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

  $('.js-appointment-date').change(e => {
    const clashesContainer = $('#clashesContainer')

    $.ajax({
      url: '/api/get-existing-events',
      data: { offenderNo: $('#offenderNo').text(), date: e.target.value },
    })
      .done(data => {
        clashesContainer.html(data).show()
      })
      .fail(() => {
        clashesContainer.hide()
      })
  })
})
