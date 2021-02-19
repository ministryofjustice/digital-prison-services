$(document).ready(function() {
  $('.date-input').each(function(index, element) {
    const disableFutureDates = Boolean($(element).data('disable-future-date'))
    const disablePastDates = Boolean($(element).data('disable-past-date'))
    const maxDate = disableFutureDates ? '0' : undefined
    const minDate = $(element).data('min-date') ? $(element).data('min-date') : disablePastDates ? '0' : undefined
    const dateFormat = 'dd/mm/yy'

    $(element).datepicker({
      dateFormat,
      showOtherMonths: true,
      selectOtherMonths: true,
      maxDate: maxDate,
      minDate: minDate,
    })
    $(element).prop('placeholder', 'DD/MM/YYYY')

    $(element).attr('readonly', 'true')
  })

  $('.js-prisoner-search-clear-alerts').click(function(e) {
    e.preventDefault()
    $('.js-prisoner-search-alerts input[type=checkbox]').prop('checked', false)
  })

  $('#notification_dismiss_box').click(function() {
    let $notification = $('#notification-bar')
    let id = $('#notification_id').val()
    let revision = $('#notification_revision').val()
    let csrf = $('#_csrf').val()

    $.ajax({
      url: '/notification/dismiss',
      type: 'POST',
      headers: {
        'X-CSRF-Token': csrf,
      },
      data: {
        id,
        revision,
      },
    })
      .done(function() {
        $notification.hide()
      })
      .fail(function() {
        window.location = '/'
      })
  })
})
