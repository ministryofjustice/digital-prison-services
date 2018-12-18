import { shape, string, bool, oneOfType, arrayOf, node } from 'prop-types'

export const childrenType = oneOfType([arrayOf(node), node])

export const routeMatchType = shape({
  isExact: bool.isRequired,
  path: string.isRequired,
  url: string.isRequired,
})
