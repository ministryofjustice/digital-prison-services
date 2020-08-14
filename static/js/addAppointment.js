$(document).ready(function() {
  const appointmentDateInput = $('.js-appointment-date')
  const appointmentLocationSelect = $('.js-appointment-location')
  const appointmentTypeSelect = $('.js-appointment-type')
  const appointmentRepeatsSelect = $('.js-appointment-repeats')
  const appointmentRepeatsTimesInput = $('.js-appointment-repeats-times')
  const lastAppointmentDate = $('.js-appointment-last-appointment')

  const appointmentEndDateContainer = $('#appointment-end-date')
  const locationEventsContainer = $('#location-events')
  const offenderEventsContainer = $('#offender-events')

  function getEventsForLocation() {
    const date = appointmentDateInput.val()
    const locationId = appointmentLocationSelect.val()

    if (date && locationId) {
      $.ajax({
        url: '/api/get-location-events',
        data: { date: date, locationId: locationId },
      })
        .done(function(data) {
          locationEventsContainer.html(data).show()
        })
        .fail(function() {
          locationEventsContainer.hide()
        })
    } else {
      locationEventsContainer.hide()
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
        data: {
          date: date,
          repeats: repeats,
          times: times,
          dateFormat: appointmentDateInput.data('moment-date-format'),
        },
      })
        .done(function(data) {
          lastAppointmentDate.show()
          appointmentEndDateContainer.text(data)
        })
        .fail(function() {
          lastAppointmentDate.hide()
          appointmentEndDateContainer.text('')
        })
    } else {
      lastAppointmentDate.hide()
      appointmentEndDateContainer.text('')
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
})
