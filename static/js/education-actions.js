$(function () {
  const $workAndSkillsAccordionButton = $('.govuk-accordion__section-button.education')
  const $openAll = $('.govuk-accordion__open-all')
  const $printLink = $('.print-link')

  const $neurodivergenceAccordionButton = $('.govuk-accordion__section-button.neurodivergence')
  const $neurodivergenceAccordion = $('#prisoner-accordion-heading-5')
  const $linkToNeurodiversityTab = $('#view-neurodivergence-link')

  $linkToNeurodiversityTab.on('click', () => {
    $neurodivergenceAccordion.trigger('click')
  })

  $neurodivergenceAccordionButton.on('click', () => {
    const expanded = $(this).attr('aria-expanded')
    const heading = this.innerText
    const action = expanded === 'false' ? 'accordion_expanded' : 'accordion_contracted'
    gtag('event', action, {
      event_category: 'Neurodivergence',
      event_label: heading,
    })
  })
  $workAndSkillsAccordionButton.on('click', function () {
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
