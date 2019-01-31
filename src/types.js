import { shape, string, bool, oneOfType, arrayOf, node } from 'prop-types'

export const childrenType = oneOfType([arrayOf(node), node])

export const metaType = shape({ touched: bool, error: string })
export const inputType = shape({ name: string.isRequired, value: string })

export const routeMatchType = shape({
  isExact: bool.isRequired,
  path: string.isRequired,
  url: string.isRequired,
})
