$(function() {
  const $date = $('#date')
  const $period = $('#period')
  const $location = $('#current-location')

  function disableInputs() {
    $period.prop('disabled', true)
    $date.prop('disabled', true)
    $location.prop('disabled', true)
  }

  function reloadPage(dateValue, periodValue) {
    window.location = '/manage-prisoner-whereabouts/select-location?date=' + dateValue + '&period=' + periodValue
  }

  $date.on('change', function() {
    let dateValue = $(this).val()
    let periodValue = $period.val()
    disableInputs()

    reloadPage(dateValue, periodValue)
  })

  $period.on('change', function() {
    let periodValue = $(this).val()
    let dateValue = $date.val()
    disableInputs()

    reloadPage(dateValue, periodValue)
  })
})
