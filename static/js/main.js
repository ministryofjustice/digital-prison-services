$(document).ready(function() {
  $('.date-input')
    .datepicker({
      dateFormat: 'dd-mm-yy',
      showOtherMonths: true,
      selectOtherMonths: true,
    })
    .datepicker('setDate', new Date())
})
