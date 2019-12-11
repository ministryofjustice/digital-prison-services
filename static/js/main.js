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
    const clashesList = $('#clashesList')

    $.ajax({
      url: '/api/get-existing-events',
      data: { offenderNo: $('#offenderNo').text(), date: e.target.value },
    })
      .done(data => {
        clashesList.empty()

        if (data.length > 0) {
          clashesContainer.show()

          data.map(event => {
            const times = event.endTime ? event.startTime + ' - ' + event.endTime : event.startTime
            clashesList.append(
              '<li><span class="appointment-clashes__event__time">' +
                times +
                '</span> ' +
                event.eventLocation +
                ' - ' +
                event.eventDescription
            )
          })
        } else {
          clashesContainer.hide()
        }
      })
      .fail(() => {
        console.log('been an error')
        clashesContainer.hide()
      })
  })
})
