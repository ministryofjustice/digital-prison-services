// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'calculateP... Remove this comment to see the full error message
const calculatePreviousUrl = (currentPageNumber, url) => {
  const newPageNumber = currentPageNumber > 0 ? currentPageNumber - 1 : 0
  url.searchParams.set('page', newPageNumber)
  return url.href
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'calculateN... Remove this comment to see the full error message
const calculateNextUrl = (currentPageNumber, totalPages, url) => {
  const newPageNumber = currentPageNumber >= totalPages ? currentPageNumber : currentPageNumber + 1
  url.searchParams.set('page', newPageNumber)
  return url.href
}

module.exports = ({ totalPages, totalElements, pageNumber, offset, pageSize, url }) => {
  const totalZeroIndexedPages = totalPages - 1
  const hasMultiplePages = totalPages > 1

  const pageList = hasMultiplePages
    ? [...Array(totalPages).keys()].map((page) => {
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
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
      href: calculatePreviousUrl(pageNumber, url),
    }

  const nextPage = hasMultiplePages &&
    pageNumber < totalZeroIndexedPages && {
      text: 'Next',
      // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 3.
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
