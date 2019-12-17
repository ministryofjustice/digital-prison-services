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

  const appointmentDate = $('.js-appointment-date')
  const appointmentLocation = $('.js-appointment-location')

  const getEventsForLocation = (locationId, date) => {
    const locationEventsContainer = $('#location-events')

    $.ajax({
      url: '/api/get-location-events',
      data: { date, locationId },
    })
      .done(data => {
        locationEventsContainer.html(data)
      })
      .fail(() => {
        locationEventsContainer.hide()
      })
  }

  const getEventsForOffender = (offenderNo, date) => {
    const offenderEventsContainer = $('#offender-events')

    $.ajax({
      url: '/api/get-offender-events',
      data: { date, offenderNo },
    })
      .done(data => {
        offenderEventsContainer.html(data)
      })
      .fail(() => {
        offenderEventsContainer.hide()
      })
  }

  appointmentLocation.change(e => {
    console.log(e.target)
    if (appointmentDate.val()) {
      getEventsForLocation(e.target.value, appointmentDate.val())
    }
  })

  appointmentDate.change(e => {
    getEventsForOffender($('#offenderNo').text(), e.target.value)

    if (appointmentLocation.val()) {
      getEventsForLocation(appointmentLocation.val(), e.target.value)
    }
  })
})
