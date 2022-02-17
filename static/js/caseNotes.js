$(function () {
  var typeSelect = $('#type')
  var subTypeSelect = $('#sub-type')
  var subTypesUrl = $('#subTypesUrl').val()
  var omicOpenWarnings = $('.case-notes-omic-open')
  var behaviourPrompts = $('.case-notes-behaviour-prompt')

  if (omicOpenWarnings.length) {
    var selectedSubTypeOption = subTypeSelect.children('option:selected').val()
    var style = selectedSubTypeOption == 'OPEN_COMM' ? 'block' : 'none'
    if (omicOpenWarnings.length) omicOpenWarnings.prop('style', 'display: ' + style)
  }

  typeSelect.on('change', function (e) {
    var selectedTypeOption = e.target && e.target.options && e.target.options[e.target.options.selectedIndex]
    if (!selectedTypeOption) return

    subTypeSelect.prop('disabled', true)
    if (omicOpenWarnings.length) omicOpenWarnings.prop('style', 'display: none')

    $.ajax({
      url: subTypesUrl,
      headers: {
        Accept: 'text/plain; charset=utf-8',
      },
      data: {
        typeCode: selectedTypeOption.value,
      },
    })
      .done(function (partialHtml) {
        subTypeSelect.prop('disabled', false)
        subTypeSelect.html(partialHtml)
      })
      .error(function () {
        subTypeSelect.prop('disabled', false)
        typeSelect.val('Select')
      })
  })

  subTypeSelect.on('change', function (e) {
    var selectedSubTypeOption = e.target && e.target.options && e.target.options[e.target.options.selectedIndex]
    if (!selectedSubTypeOption) return

    var style = selectedSubTypeOption.value == 'OPEN_COMM' ? 'block' : 'none'
    if (omicOpenWarnings.length) omicOpenWarnings.prop('style', 'display: ' + style)
  })

  if (behaviourPrompts.length) {
    function toggleBehvaiourPrompts () {
      behaviourPrompts.prop('open', false)
      behaviourPrompts.hide()
      var entryType = typeSelect.val()
      if (entryType === 'POS') {
        $('.case-notes-behaviour-prompt--pos').show()
      } else if (entryType === 'NEG') {
        $('.case-notes-behaviour-prompt--neg').show()
      }
    }

    typeSelect.on('change', toggleBehvaiourPrompts)
    toggleBehvaiourPrompts()
  }
})
