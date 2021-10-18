$(function () {
  const $accordionButton = $('.govuk-accordion__section-button.education')

  $accordionButton.on('click', function () {

    const expanded = $(this).attr('aria-expanded')
    if (expanded === 'false') {
      const heading = this.innerText
      const action = 'accordion_expanded'
      gtag('event', action, {
        event_category : 'Education',
        event_label: heading
      })
    }
  })
})
