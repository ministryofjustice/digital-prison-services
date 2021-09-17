$(function () {
  var typeSelect = $('#type')
  var subTypeSelect = $('#sub-type')
  var subTypesUrl = $('#subTypesUrl').val()
  var omicOpenWarnings = $('.case-notes-omic-open')

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
})
