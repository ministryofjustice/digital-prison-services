$(document).ready(function () {
  $('.modal_dialog_button').each(function (index, element) {
    $(element).click(function (e) {
      console.log('OPENING!!')
      const clickedElement = e.currentTarget
      const dialogDataModuleSuffix = clickedElement.dataset.module
      const dialogue = document.querySelector(`[data-module="govuk-modal-dialogue-${dialogDataModuleSuffix}"]`)
      const dialogueButtonResume = document.querySelector(`.govuk-modal-dialogue__continue-${dialogDataModuleSuffix}`)

      if (dialogue && dialogueButtonResume) {
        console.log('OPENED!!')
        new window.ModalDialogue(dialogue).init({
          focusElement: dialogueButtonResume,
          onClose: function () {
            console.log('CLOSED!!')
          },
        })
      }
    })
  })

  $('.date-input').each(function (index, element) {
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

  $('.js-prisoner-search-clear-alerts').click(function (e) {
    e.preventDefault()
    $('.js-prisoner-search-alerts input[type=checkbox]').prop('checked', false)
  })

  $('#notification_dismiss_box').click(function () {
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
      .done(function () {
        $notification.hide()
      })
      .fail(function () {
        window.location = '/'
      })
  })
})
