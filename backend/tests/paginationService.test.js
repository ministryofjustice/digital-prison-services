const service = require('../services/paginationService')

describe('Pagination service', () => {
  it('should return pages, previous, next and results when more than one page', () => {
    const response = service.getPagination(100, 0, 20, new URL('http://localhost/'))
    expect(response).toEqual({
      classes: 'govuk-!-font-size-19',
      items: [
        { text: 1, href: 'http://localhost/?pageOffsetOption=0', selected: true },
        { text: 2, href: 'http://localhost/?pageOffsetOption=20', selected: false },
        { text: 3, href: 'http://localhost/?pageOffsetOption=40', selected: false },
        { text: 4, href: 'http://localhost/?pageOffsetOption=60', selected: false },
        { text: 5, href: 'http://localhost/?pageOffsetOption=80', selected: false },
      ],
      next: { text: 'Next', href: 'http://localhost/?pageOffsetOption=20' },
      previous: { text: 'Previous', href: 'http://localhost/?pageOffsetOption=0' },
      results: { count: 100, from: 1, to: 20 },
    })
  })

  it('should return results, but no pages if results fit on one page', () => {
    const response = service.getPagination(19, 0, 20, new URL('http://localhost/'))
    expect(response).toEqual({
      classes: 'govuk-!-font-size-19',
      items: [],
      next: undefined,
      previous: undefined,
      results: { count: 19, from: 1, to: 19 },
    })
  })

  it('should correctly calculate next when on last page', () => {
    const response = service.getPagination(100, 80, 20, new URL('http://localhost/'))
    expect(response).toEqual({
      classes: 'govuk-!-font-size-19',
      items: [
        { text: 1, href: 'http://localhost/?pageOffsetOption=0', selected: false },
        { text: 2, href: 'http://localhost/?pageOffsetOption=20', selected: false },
        { text: 3, href: 'http://localhost/?pageOffsetOption=40', selected: false },
        { text: 4, href: 'http://localhost/?pageOffsetOption=60', selected: false },
        { text: 5, href: 'http://localhost/?pageOffsetOption=80', selected: true },
      ],
      next: { text: 'Next', href: 'http://localhost/?pageOffsetOption=80' },
      previous: { text: 'Previous', href: 'http://localhost/?pageOffsetOption=60' },
      results: { count: 100, from: 81, to: 100 },
    })
  })
})
