const maxNumberOfPageLinks = 10
const pageBreakPoint = maxNumberOfPageLinks / 2

/*

The pagination service only shows ten page links regardless of where the current page is pointed.

Rules:
  1) Show ten page links
  2) Show pages 5 before and after the current page
  3) Where there are less than 5 pages before the current page show the remaining
  4) Where there are more than 5 pages after the current page show the remaining

1 2 3 4 5 6 7 8 9 10
^

1 2 3 4 5 6 7 8 9 10
          ^

2 3 4 5 6 7 8 9 10 11
          ^

4 5 6 7 8 9 10 11 12 13
          ^

2 3 4 5 6 7 8 9 10 11
          ^

4 5 6 7 8 9 10 11 13 14
          ^

4 5 6 7 8 9 10 11 13 14
            ^

4 5 6 7 8 9 10 11 13 14
                ^
 */

export const calculateNextUrl = (offset, limit, totalResults, url) => {
  const newOffset = offset + limit >= totalResults ? offset : offset + limit
  url.searchParams.set('pageOffsetOption', newOffset)
  return url.href
}

export const calculatePreviousUrl = (offset, limit, url) => {
  const newOffset = offset > 0 ? offset - limit : 0
  url.searchParams.set('pageOffsetOption', newOffset)
  return url.href
}

export const getPagination = (totalResults, offset, limit, url) => {
  const toPageNumberNode = (page) => {
    const pageOffset = limit * page

    url.searchParams.set('pageOffsetOption', pageOffset)
    return {
      text: page + 1,
      href: url.href,
      selected: offset === pageOffset,
    }
  }

  const useLowestNumber = (left, right) => (left >= right ? right : left)

  const calculateFrom = ({ currentPage, numberOfPages }) => {
    if (numberOfPages <= maxNumberOfPageLinks) return 0

    const towardsTheEnd = numberOfPages - currentPage <= pageBreakPoint

    if (towardsTheEnd) return numberOfPages - maxNumberOfPageLinks

    return currentPage <= pageBreakPoint ? 0 : currentPage - pageBreakPoint
  }

  const currentPage = offset === 0 ? 0 : Math.ceil(offset / limit)
  const numberOfPages = Math.ceil(totalResults / limit)

  const allPages = numberOfPages > 0 && [...Array(numberOfPages).keys()]
  const from = calculateFrom({ currentPage, numberOfPages })
  const to =
    numberOfPages <= maxNumberOfPageLinks
      ? numberOfPages
      : useLowestNumber(from + maxNumberOfPageLinks, allPages.length)

  const pageList = (numberOfPages > 1 && allPages.slice(from, to)) || []

  const previousPage =
    numberOfPages > 1 && currentPage !== from
      ? {
          text: 'Previous',
          href: calculatePreviousUrl(offset, limit, url),
        }
      : undefined
  const nextPage =
    numberOfPages > 1 && currentPage !== to - 1
      ? {
          text: 'Next',
          href: calculateNextUrl(offset, limit, totalResults, url),
        }
      : undefined

  return {
    items: pageList.map(toPageNumberNode),
    previous: previousPage,
    next: nextPage,
    results: {
      from: offset + 1,
      to: numberOfPages > 1 && offset + limit < totalResults ? offset + limit : totalResults,
      count: totalResults,
    },
    classes: 'govuk-!-font-size-19',
  }
}

export default {
  getPagination,
}
