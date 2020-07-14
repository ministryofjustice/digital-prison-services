const calculatePreviousUrl = (currentPageNumber, newUrl) => {
  const newPageNumber = currentPageNumber > 0 ? currentPageNumber - 1 : 0
  newUrl.searchParams.set('page', newPageNumber)
  return newUrl.href
}

const calculateNextUrl = (currentPageNumber, totalPages, newUrl) => {
  const newPageNumber = currentPageNumber >= totalPages ? currentPageNumber : currentPageNumber + 1
  newUrl.searchParams.set('page', newPageNumber)
  return newUrl.href
}

module.exports = ({ totalPages, totalElements, pageNumber, offset, pageSize, url }) => {
  const totalZeroIndexedPages = totalPages - 1
  const hasMultiplePages = totalPages > 1

  const pageList = hasMultiplePages
    ? [...Array(totalPages).keys()].map(page => {
        url.searchParams.set('page', page)
        return {
          text: page + 1,
          href: url.href,
          selected: pageNumber === page,
        }
      })
    : []

  const previousPage = hasMultiplePages &&
    pageNumber > 0 && {
      text: 'Previous',
      href: calculatePreviousUrl(pageNumber, url),
    }

  const nextPage = hasMultiplePages &&
    pageNumber < totalZeroIndexedPages && {
      text: 'Next',
      href: calculateNextUrl(pageNumber, totalZeroIndexedPages, url),
    }

  return {
    items: pageList,
    previous: previousPage,
    next: nextPage,
    results: {
      from: offset + 1,
      to: totalPages > 1 && offset + pageSize < totalElements ? offset + pageSize : totalElements,
      count: totalElements,
    },
    classes: 'govuk-!-font-size-19',
  }
}
