$(function () {
  // record incentive level confirmation page
  $('.govuk-button').on('click', function (e) {
    var $prompt = $(e.target)
    var gaId = $prompt.data('ga-id')
    var caseload = $prompt.data('case-load')
    if (gaId && typeof gtag === 'function') {
      gtag('event', 'click', {
        event_category: gaId,
        event_label: caseload,
      })
    }
  })
})
