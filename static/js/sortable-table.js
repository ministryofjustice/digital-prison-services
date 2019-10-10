// This has been adapted from https://github.com/LJWatson/sortable-tables
// as a first pass on sorting tables outside of React

var sortOrder

// Initialization of all sortable tables in the page

/**
 * Initialization
 * Configure all sortable tables on the page
 */
var sortableTables = document.getElementsByClassName('sortable')
;[].forEach.call(sortableTables, function(table) {
  // Add a default ARIA unsorted state, and attach the sort
  // handler to any sortable columns in this table.
  var cellIndex = 0 // track numeric cell index to simplify sort logic
  var headerCells = table.getElementsByClassName('govuk-table__header')
  ;[].forEach.call(headerCells, function(th) {
    th.setAttribute('aria-sort', 'none')
    th.dataset.index = cellIndex++
    th.addEventListener('click', sortCol)
  })

  // Give the span 'buttons' within the table headers focus and keyboard handling
  var buttonSpans = table.getElementsByClassName('th-content')
  ;[].forEach.call(buttonSpans, function(span) {
    span.setAttribute('role', 'button')
    span.setAttribute('tabindex', '0')
    span.addEventListener('keydown', function(e) {
      if (e.which === 13 || e.which === 32) {
        this.click()
      }
    })
  })
})

/**
 * getParentTable - helper to find the parent table element from any child node
 *
 * @param  {HTMLElement} node any child node in a table
 * @return {HTMLElement}      parent table or undef
 */
function getParentTable(node) {
  while (node) {
    node = node.parentNode
    if (node.tagName.toLowerCase() === 'table') {
      return node
    }
  }
  return undefined
}

/**
 * sortCol - Sort event handler. Attached to all sortable column headers
 *
 * @param  {Event} e The event triggering the sort action
 */
function sortCol(e) {
  // sortCol event gets triggered from the th or the nested span,
  // identify the TH col, and assign some element lookups
  var thisCol = e.target.tagName === 'TH' ? e.target : e.target.parentNode
  var table = getParentTable(thisCol)
  var tbody = table.getElementsByTagName('tbody').item(0)
  var rows = tbody.getElementsByTagName('tr')
  var cols = table.getElementsByClassName('sortable-column')

  var sortType = thisCol.getAttribute('data-sortby')
  var thisIndex = thisCol.getAttribute('data-index')

  // update the sort icon and return the new sort state
  sortOrder = updateIcon(thisCol)

  // loop through each row and build our `items` array
  // which will become an array of objects:
  // {
  //  tr: (the HTMLElement reference to the given row),
  //  val: (the String value of the corresponding td)
  // }
  var items = []
  ;[].forEach.call(rows, function(row) {
    var content = row.getElementsByTagName('td').item(thisIndex)
    items.push({ tr: row, val: content.innerText })
  })

  // sort the array of values, using an appropriate sorter
  if (!sortType || sortType === 'numeric') {
    items.sort(numericSort)
  } else if (sortType === 'date') {
    items.sort(dateSort)
  } else if (sortType === 'text') {
    items.sort(sortAlphaNum)
  } else if (sortType === 'money') {
    items.sort(moneySort)
  }

  // Create a new table body, appending each row in the new, sorted order
  var newTbody = document.createElement('tbody')
  ;[].forEach.call(items, function(item) {
    newTbody.appendChild(item.tr)
  })

  // Swap out the existing table body with our reconstructed sorted body
  table.replaceChild(newTbody, tbody)
}

/**
 * updateIcon - Updates the arrow icon based on new sort status
 * @param  {HTMLElement} th    The table heading element reference
 * @return {String}      state The new sort state ("ascending" or "descending")
 */
function updateIcon(th) {
  var state = 'ascending'
  var icon = th.getElementsByTagName('i').item(0)
  var ourIndex = th.getAttribute('data-index')
  // classList is supported in pretty much everything after IE8,
  // use that rather than a regex to modify the arrow classes
  if (icon.classList.contains('arrow')) {
    // No sort -> Ascending
    icon.classList.remove('arrow')
    icon.classList.add('arrow-up')
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
  var allTh = th.parentNode.getElementsByClassName('govuk-table__header')
  ;[].forEach.call(allTh, function(thisTh, thisIndex) {
    // skip our sorted column
    if (thisIndex == ourIndex) {
      return
    }
    // reset the state for an unsorted column
    thisTh.setAttribute('aria-sort', 'none')
    var thisIcon = thisTh.getElementsByTagName('i').item(0)
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
