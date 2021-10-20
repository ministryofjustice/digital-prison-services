$(function () {
  const $accordionButton = $('.govuk-accordion__section-button.education')
  const $openAll = $('.govuk-accordion__open-all')
  const $printLink = $('.print-link')

  $accordionButton.on('click', function () {
    const expanded = $(this).attr('aria-expanded')
    const heading = this.innerText
    const action = expanded === 'false' ? 'accordion_expanded' : 'accordion_contracted'
    gtag('event', action, {
      event_category: 'Education',
      event_label: heading,
    })
  })

  $openAll.on('click', function () {
    const expanded = $(this).attr('aria-expanded')
    const action = expanded === 'false' ? 'accordion_all_expanded' : 'accordion_all_contracted'
    gtag('event', action, {
      event_category: 'Education',
      event_label: $(this).parent('[id]').id,
    })
  })

  $printLink.on('click', function () {
    const action = 'print_selected'
    const title = $('title').text()
    gtag('event', action, {
      event_category: 'Education',
      event_label: title,
    })
  })
})
