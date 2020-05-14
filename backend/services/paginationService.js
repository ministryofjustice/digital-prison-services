const calculateNextUrl = (offset, limit, totalResults, url) => {
  const newOffset = offset + limit >= totalResults ? offset : offset + limit
  url.searchParams.set('pageOffsetOption', newOffset)
  return url.href
}

const calculatePreviousUrl = (offset, limit, url) => {
  const newOffset = offset > 0 ? offset - limit : 0
  url.searchParams.set('pageOffsetOption', newOffset)
  return url.href
}

const getPagination = (totalResults, offset, limit, url) => {
  const numberOfPages = Math.ceil(totalResults / limit)

  const pageList =
    numberOfPages > 1
      ? [...Array(numberOfPages).keys()].map(page => {
          url.searchParams.set('pageOffsetOption', limit * page)
          return {
            text: page + 1,
            href: url.href,
            selected: offset === limit * page,
          }
        })
      : []

  const previousPage =
    numberOfPages > 1
      ? {
          text: 'Previous',
          href: calculatePreviousUrl(offset, limit, url),
        }
      : undefined
  const nextPage =
    numberOfPages > 1
      ? {
          text: 'Next',
          href: calculateNextUrl(offset, limit, totalResults, url),
        }
      : undefined

  return {
    items: pageList,
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

module.exports = {
  getPagination,
}
