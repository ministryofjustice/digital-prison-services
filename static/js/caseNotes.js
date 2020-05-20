$(function() {
  var typeSelect = $('#type')
  var subTypeSelect = $('#subType')
  var subTypesDiv = $('#subTypes')
  var subTypesUrl = $('#subTypesUrl').val()

  typeSelect.on('change', function(e) {
    var selectedTypeOption = e.target && e.target.options && e.target.options[e.target.options.selectedIndex]
    if (!selectedTypeOption) return

    subTypeSelect.prop('disabled', true)

    $.ajax({
      url: subTypesUrl,
      headers: {
        Accept: 'text/plain; charset=utf-8',
      },
      data: {
        typeCode: selectedTypeOption.value,
      },
    })
      .done(function(partialHtml) {
        subTypeSelect.prop('disabled', false)
        subTypesDiv.html(partialHtml)
      })
      .error(function() {
        subTypeSelect.prop('disabled', false)
        typeSelect.val('Select')
      })
  })
})
