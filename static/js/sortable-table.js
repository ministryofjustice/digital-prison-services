// This is adapted from https://github.com/LJWatson/sortable-tables

window.onload = function() {
  const sortableTable = document.getElementById('offenderListTable')
  sortTable(sortableTable)
}

let sortOrder

function sortTable(table) {
  // Add a default ARIA unsorted state, and attach the sort
  // handler to any sortable columns in this table.

  // Not using ES6 syntax for looping as not support by IE
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of

  let cellIndex = 0 // track numeric cell index to simplify sort logic
  const headerCells = table.getElementsByClassName('govuk-table__header')
  ;[].forEach.call(headerCells, function(th) {
    th.setAttribute('aria-sort', 'none')
    th.dataset.index = cellIndex++
    if (th.classList.contains('sortableLink')) {
      th.addEventListener('click', sortCol)
    }
  })

  const options = document.getElementsByTagName('option')
  ;[].forEach.call(options, function(option) {
    option.addEventListener('click', sortCol)
  })

  // Give the span 'buttons' within the table headers focus and keyboard handling
  const buttonSpans = table.getElementsByClassName('th-content')
  ;[].forEach.call(buttonSpans, function(span) {
    span.setAttribute('role', 'button')
    span.setAttribute('tabindex', '0')
  })
}

function getParentTable(node) {
  while (node) {
    node = node.parentNode
    if (node.tagName.toLowerCase() === 'table') {
      return node
    }
  }
  return undefined
}

function getColumnFromEvent(e) {
  // closest isn't supported in IE, spaghetti as a result
  // https://caniuse.com/#search=closest

  // They clicked on the header
  if (e.target.tagName === 'TH') {
    return e.target
    // The clicked on the span
  } else if (e.target.parentNode.tagName === 'TH') {
    return e.target.parentNode
    // They clicked on the icon
  } else if (e.target.parentNode.parentNode.tagName === 'TH') {
    return e.target.parentNode.parentNode
    // They used the dropdown
  } else {
    let [colIndex, sortOrderOption] = e.target.value.split('_')
    sortOrder = sortOrderOption
    return document.querySelector(`[data-index="${colIndex}"]`)
  }
}

function sortCol(e) {
  // sortCol event gets triggered from the th, the nested span,
  // the icon or the dropdown.

  const thisCol = getColumnFromEvent(e)
  const table = getParentTable(thisCol)
  const tbody = table.getElementsByTagName('tbody').item(0)
  const rows = tbody.getElementsByTagName('tr')
  const thisIndex = thisCol.getAttribute('data-index')

  // update the sort icon and return the new sort state
  sortOrder = updateIcon(thisCol)

  // loop through each row and build our `items` array
  // which will become an array of objects:
  // {
  //  tr: (the HTMLElement reference to the given row),
  //  val: (the String value of the corresponding td)
  // }
  const items = []
  ;[].forEach.call(rows, function(row) {
    const content = row.getElementsByTagName('td').item(thisIndex)
    items.push({ tr: row, val: content.innerText })
  })

  items.sort(sortAlphaNum)

  // Create a new table body, appending each row in the new, sorted order
  const newTbody = document.createElement('tbody')
  ;[].forEach.call(items, function(item) {
    newTbody.appendChild(item.tr)
  })

  // Swap out the existing table body with our reconstructed sorted body
  table.replaceChild(newTbody, tbody)
}

function updateIcon(th) {
  // The sortOrder will be set if the user used the dropdown
  let state = sortOrder || 'ascending'
  const icon = th.getElementsByTagName('i').item(0)
  const ourIndex = th.getAttribute('data-index')
  // classList is supported in pretty much everything after IE8,
  // use that rather than a regex to modify the arrow classes
  if (icon.classList.contains('arrow')) {
    icon.classList.remove('arrow')
    if (state === 'ascending') {
      icon.classList.add('arrow-up')
    } else if (state === 'descending') {
      icon.classList.add('arrow-down')
    }
  } else if (icon.classList.contains('arrow-down')) {
    // Descending -> Ascending
    icon.classList.remove('arrow-down')
    icon.classList.add('arrow-up')
    state = 'ascending'
  } else {
    // Ascending -> Descending
    icon.classList.remove('arrow-up')
    icon.classList.add('arrow-down')
    state = 'descending'
  }

  th.setAttribute('aria-sort', state)
  // update all other rows with the neutral sort icon
  const allTh = th.parentNode.getElementsByClassName('govuk-table__header')
  ;[].forEach.call(allTh, function(thisTh, thisIndex) {
    // skip our sorted column
    if (thisIndex == ourIndex) {
      return
    }
    // reset the state for an unsorted column
    thisTh.setAttribute('aria-sort', 'none')
    const thisIcon = thisTh.getElementsByTagName('i').item(0)
    if (thisIcon) {
      thisIcon.classList.remove('arrow-up')
      thisIcon.classList.remove('arrow-down')
      thisIcon.classList.add('arrow')
    }
  })
  return state
}

function sortAlphaNum(a, b) {
  a = a.val.toLowerCase()
  b = b.val.toLowerCase()
  if (sortOrder === 'ascending') {
    return a.localeCompare(b, 'en', { numeric: true, ignorePunctuation: true })
  }
  return b.localeCompare(a, 'en', { numeric: true, ignorePunctuation: true })
}
