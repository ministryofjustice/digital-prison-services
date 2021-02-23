$(function() {
  const $date = $('#date')
  const $period = $('#period')
  const $location = $('#current-location')
  const $submit = $('[type="submit"]')

  function disableInputs() {
    $period.prop('disabled', true)
    $date.prop('disabled', true)
    $location.prop('disabled', true)
    $submit.prop('disabled', true)
  }

  function reloadPage(dateValue, periodValue) {
    window.location = '/manage-prisoner-whereabouts/select-location?date=' + dateValue + '&period=' + periodValue
  }

  $date.on('change', function() {
    const dateValue = $(this).val()
    const periodValue = $period.val()
    disableInputs()

    reloadPage(dateValue, periodValue)
  })

  $period.on('change', function() {
    const periodValue = $(this).val()
    const dateValue = $date.val()
    disableInputs()

    reloadPage(dateValue, periodValue)
  })
})
