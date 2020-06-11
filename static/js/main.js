$(document).ready(function() {
  $('.date-input').each(function(index, element) {
    const disableFutureDates = Boolean($(element).data('disable-future-date'))
    const disablePastDates = Boolean($(element).data('disable-past-date'))
    const maxDate = disableFutureDates ? '0' : undefined
    const minDate = disablePastDates ? '0' : undefined
    $(element).datepicker({
      dateFormat: 'dd/mm/yy',
      showOtherMonths: true,
      selectOtherMonths: true,
      maxDate: maxDate,
      minDate: minDate,
    })
  })

  const appointmentDateInput = $('.js-appointment-date')
  const appointmentLocationSelect = $('.js-appointment-location')
  const appointmentTypeSelect = $('.js-appointment-type')
  const appointmentRepeatsSelect = $('.js-appointment-repeats')
  const appointmentRepeatsTimesInput = $('.js-appointment-repeats-times')
  const lastAppointmentDate = $('.js-appointment-last-appointment')

  const appointmentEndDateContainer = $('#appointment-end-date')
  const locationEventsContainer = $('#location-events')
  const offenderEventsContainer = $('#offender-events')
  const locationEventsContainerPreAppointments = $('#location-events-preAppointment')
  const locationSelectPreAppointment = $('#preAppointmentLocation')
  const locationEventsContainerPostAppointments = $('#location-events-postAppointment')
  const locationSelectPostAppointment = $('#postAppointmentLocation')

  function getEventsForLocation() {
    const date = appointmentDateInput.val()
    const locationId = appointmentLocationSelect.val()

    if (date && locationId) {
      $.ajax({
        url: '/api/get-location-events',
        data: { date: date, locationId: locationId },
      })
        .done(function(data) {
          console.log(data)
          locationEventsContainer.html(data).show()
        })
        .fail(function() {
          locationEventsContainer.hide()
        })
    } else {
      locationEventsContainer.hide()
    }
  }

  function getPrePostEventsForLocation(e, container) {
    const locationId = Number(e.target.value)
    const date = $('#appointment-date').val()

    if (date && locationId) {
      $.ajax({
        url: '/api/get-location-events',
        data: {
          date: date,
          locationId: locationId,
        },
      })
        .done(function(data) {
          container.html(data).show()
        })
        .fail(function() {
          container.hide()
        })
    }
  }

  function getEventsForOffender(offenderNo, date) {
    $.ajax({
      url: '/api/get-offender-events',
      data: { date: date, offenderNo: offenderNo },
    })
      .done(function(data) {
        offenderEventsContainer.html(data)
      })
      .fail(function() {
        offenderEventsContainer.hide()
      })
  }

  function getAppointmentEndDate() {
    const date = appointmentDateInput.val()
    const repeats = appointmentRepeatsSelect.children('option:selected').val()
    const times = appointmentRepeatsTimesInput.val()

    if (date && times) {
      $.ajax({
        url: '/api/get-recurring-end-date',
        data: { date: date, repeats: repeats, times: times },
      })
        .done(function(data) {
          lastAppointmentDate.show()
          appointmentEndDateContainer.text(data)
        })
        .fail(function() {
          lastAppointmentDate.hide()
          appointmentEndDateContainer.text('--')
        })
    } else {
      lastAppointmentDate.hide()
      appointmentEndDateContainer.text('--')
    }
  }

  appointmentTypeSelect
    .add(appointmentLocationSelect)
    .add(appointmentDateInput)
    .change(function() {
      getEventsForLocation()
    })

  appointmentDateInput.change(function() {
    const offenderNo = $('#offenderNo').text()
    if (offenderNo) {
      getEventsForOffender(offenderNo, $(this).val())
    }
  })

  appointmentRepeatsSelect.add(appointmentDateInput).change(function() {
    getAppointmentEndDate()
  })

  appointmentRepeatsTimesInput.keyup(function() {
    getAppointmentEndDate()
  })

  locationSelectPreAppointment.change(function(e) {
    getPrePostEventsForLocation(e, locationEventsContainerPreAppointments)
  })
  locationSelectPostAppointment.change(function(e) {
    getPrePostEventsForLocation(e, locationEventsContainerPostAppointments)
  })
})
