$(document).ready(function() {
  const locationEventsContainerPreAppointments = $('#location-events-preAppointment')
  const locationSelectPreAppointment = $('#preAppointmentLocation')
  const locationEventsContainerPostAppointments = $('#location-events-postAppointment')
  const locationSelectPostAppointment = $('#postAppointmentLocation')

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

  locationSelectPreAppointment.change(function(e) {
    getPrePostEventsForLocation(e, locationEventsContainerPreAppointments)
  })
  locationSelectPostAppointment.change(function(e) {
    getPrePostEventsForLocation(e, locationEventsContainerPostAppointments)
  })
})
