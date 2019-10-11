// This is adapted from https://github.com/LJWatson/sortable-tables

let sortOrder

// Initialization of all sortable tables in the page

/**
 * Initialization
 * Configure all sortable tables on the page
 */
const sortableTables = document.getElementsByClassName('sortable')
;[].forEach.call(sortableTables, function(table) {
  // Add a default ARIA unsorted state, and attach the sort
  // handler to any sortable columns in this table.
  let cellIndex = 0 // track numeric cell index to simplify sort logic
  const headerCells = table.getElementsByClassName('govuk-table__header')
  ;[].forEach.call(headerCells, function(th) {
    th.setAttribute('aria-sort', 'none')
    th.dataset.index = cellIndex++
    if (th.classList.contains('sortableLink')) {
      th.addEventListener('click', sortCol)
    }
  })

  // Give the span 'buttons' within the table headers focus and keyboard handling
  const buttonSpans = table.getElementsByClassName('th-content')
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

  // closest isn't supported in IE, spaghetti as a result
  // https://caniuse.com/#search=closest
  let thisCol
  if (e.target.tagName === 'TH') {
    thisCol = e.target
  } else if (e.target.parentNode.tagName === 'TH') {
    thisCol = e.target.parentNode
  } else {
    thisCol = e.target.parentNode.parentNode
  }
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

/**
 * updateIcon - Updates the arrow icon based on new sort status
 * @param  {HTMLElement} th    The table heading element reference
 * @return {String}      state The new sort state ("ascending" or "descending")
 */
function updateIcon(th) {
  let state = 'ascending'
  const icon = th.getElementsByTagName('i').item(0)
  const ourIndex = th.getAttribute('data-index')
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
